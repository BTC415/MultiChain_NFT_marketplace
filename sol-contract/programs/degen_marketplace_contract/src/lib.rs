use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Mint};
use anchor_lang::solana_program::{clock};
use crate::constants::*;

declare_id!("EJpcoKdCNCQUgauCLdLpiqC9EmaG8HEBZpCFqUDBMvZG");

mod constants {
    use anchor_lang::prelude::Pubkey;

    pub const ADMIN_KEY: Pubkey = anchor_lang::solana_program::pubkey!("3ttYrBAp5D2sTG2gaBjg8EtrZecqBQSBuFRhsqHWPYxX");
    pub const LAMPORTS_PER_SOL: u64 = 1000000000;
    pub const MARKET_FEE: u32 = 170;
}

#[program]
pub mod degen_marketplace_contract {

    use super::*;
    use anchor_lang::AccountsClose;

    pub fn list(ctx: Context<ListContext>, price_high: u32, price_low: u32, bump: u8) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user = &ctx.accounts.user;
        let mint = &ctx.accounts.mint;
        let clock = clock::Clock::get().unwrap();

        pool.user = *user.to_account_info().key;
        pool.mint = *mint.to_account_info().key;
        pool.price = price_high as u64 * LAMPORTS_PER_SOL + price_low as u64;
        pool.start_time = clock.unix_timestamp as u32;
        pool.bump = bump;

        if pool.user != *user.to_account_info().key {
            return Err(CustomError::InvalidUser.into())
        }

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_from.to_account_info(),
                to: ctx.accounts.token_to.to_account_info(),
                authority: ctx.accounts.user.to_account_info()
            }
        );

        token::transfer(cpi_ctx, 1)?;
        Ok(())
        
    }

    pub fn update_list(ctx: Context<UpdateListContext>, price_high: u32, price_low: u32) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user = &ctx.accounts.user;

        if pool.user != *user.to_account_info().key {
            return Err(CustomError::InvalidUser.into())
        }

        pool.price = price_high as u64 * LAMPORTS_PER_SOL + price_low as u64;
        Ok(())
    }

    pub fn cancel_list(ctx: Context<CancelListContext>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user = &ctx.accounts.user;

        if pool.user != *user.to_account_info().key {
            return Err(CustomError::InvalidUser.into())
        }

        let pool_seeds = &[
            b"pool".as_ref(),
            ctx.accounts.user.to_account_info().key.as_ref(),
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[pool.bump]
        ];

        let pool_signer = &[&pool_seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_from.to_account_info(),
                to: ctx.accounts.token_to.to_account_info(),
                authority: pool.to_account_info()
            },
            pool_signer
        );

        token::transfer(cpi_ctx, 1)?;

        pool.close(ctx.accounts.user.to_account_info())?;
        Ok(())
    }

    pub fn buy<'info>(ctx: Context<'_, '_, '_, 'info, BuyContext<'info>> , method: u8) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let meta_data = &ctx.accounts.metadata;
        let mint = &ctx.accounts.mint;
        let system_program = &ctx.accounts.system_program;
        let data = meta_data.try_borrow_data()?;
        let metadata = mpl_token_metadata::state::Metadata::deserialize(&mut &data[..])?;
        
        let pool_seeds = &[
            b"pool".as_ref(),
            ctx.accounts.seller.to_account_info().key.as_ref(),
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[pool.bump],
        ];

        let pool_signer = &[&pool_seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer (
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_from.to_account_info(),
                to: ctx.accounts.token_to.to_account_info(),
                authority: pool.to_account_info()
            },
            pool_signer
        );

        token::transfer(cpi_ctx, 1)?;
        if method == 0 {
            let cpi_ctx = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info()
                }
            );

            anchor_lang::system_program::transfer(cpi_ctx, pool.price)?;
        }
        else {

            let creators = metadata.data.creators.unwrap();

            if metadata.mint != mint.to_account_info().key() {
                return Err(error!(CustomError::InvalidMetadata));
            }

            let admin_sol: u64 = (pool.price * MARKET_FEE as u64) / 10000;
            let creators_sol: u64 = (pool.price * metadata.data.seller_fee_basis_points as u64) / 10000;
            let seller_sol: u64 = pool.price - admin_sol - creators_sol;

            msg!("admin_sol: {}, creator_sol: {}, sellser_sol: {}", admin_sol, creators_sol, seller_sol);
            
            if creators.len() != ctx.remaining_accounts.len() {
                return Err(error!(CustomError::InvalidCreator));
            }

            let cpi_ctx = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info()
                }
            );

            anchor_lang::system_program::transfer(cpi_ctx, seller_sol)?;

            let cpi_ctx = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.admin.to_account_info()
                }
            );

            anchor_lang::system_program::transfer(cpi_ctx, admin_sol)?;

            let mut i: usize = 0;
            loop {
                if i >= creators.len() {
                    break;
                }

                let creator = &creators[i];
                let a_creator = &ctx.remaining_accounts[i];

                if creator.address != a_creator.to_account_info().key() {
                    return Err(error!(CustomError::InvalidCreator));
                }
                let creator_sol = creators_sol * creator.share as u64 / 100;
                msg!("creator_sol {}", creator_sol);
                let cpi_ctx = CpiContext::new(
                    system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.buyer.to_account_info(),
                        to: a_creator.to_account_info()
                    }
                );
        
                anchor_lang::system_program::transfer(cpi_ctx, creator_sol)?;

                i += 1;
            }
        }

        pool.close(ctx.accounts.seller.to_account_info())?;

        Ok(())
    }

    pub fn create_bid(ctx: Context<CreateBidContext>, price_high: u32, price_low: u32, bump : u8) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let bid = &mut ctx.accounts.bid;
        let bidder = &ctx.accounts.bidder;
        let pool = &ctx.accounts.pool;
        let system_program = &ctx.accounts.system_program;

        let bid_price = price_high as u64 * LAMPORTS_PER_SOL + price_low as u64;

        if bid_price > pool.price || bid_price < pool.price / 2 {
            return Err(error!(CustomError::WrongPrice));
        }

        bid.bidder = bidder.to_account_info().key();
        bid.mint = ctx.accounts.mint.to_account_info().key();
        bid.token_account = ctx.accounts.token_account.to_account_info().key();
        bid.price = bid_price; 
        bid.bump = bump;

        let cpi_ctx = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: bidder.to_account_info(),
                to: vault.to_account_info()
            }
        );

        anchor_lang::system_program::transfer(cpi_ctx, bid_price)?;
        Ok(())
    }

    pub fn update_bid(ctx: Context<UpdateBidContext>, price_high: u32, price_low: u32) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let bid = &mut ctx.accounts.bid;
        let bidder = &ctx.accounts.bidder;
        let pool = &ctx.accounts.pool;
        let system_program = &ctx.accounts.system_program;

        let bid_price = price_high as u64 * LAMPORTS_PER_SOL + price_low as u64;

        if bid_price > pool.price || bid_price < pool.price / 2 {
            return Err(error!(CustomError::WrongPrice));
        }

        let mut cpi_ctx = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: vault.to_account_info(),
                to: bidder.to_account_info()
            },
        );

        anchor_lang::system_program::transfer(cpi_ctx, bid.price)?;

        cpi_ctx = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: bidder.to_account_info(),
                to: vault.to_account_info()
            }
        );

        anchor_lang::system_program::transfer(cpi_ctx, bid_price)?;

        bid.price = bid_price; 
        Ok(())
    }


    pub fn cancel_bid(ctx: Context<CancelBidContext>) -> Result<()> {
        let bid = &mut ctx.accounts.bid;
        let bidder = &ctx.accounts.bidder;
        let vault = &ctx.accounts.vault;
        let system_program = &ctx.accounts.system_program;

        let cpi_ctx = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: vault.to_account_info(),
                to: bidder.to_account_info()
            }
        );

        anchor_lang::system_program::transfer(cpi_ctx, bid.price)?;

        ctx.accounts.bid.close(bidder.to_account_info())?;
        Ok(())
    }

    pub fn accept_bid<'info>(ctx: Context<'_, '_, '_, 'info, AcceptBidContext<'info>>, method: u8) -> Result<()> {
        let meta_data = &ctx.accounts.metadata;
        let bid = &ctx.accounts.bid;
        let pool = &mut ctx.accounts.pool;
        let mint = &ctx.accounts.mint;
        let system_program = &ctx.accounts.system_program;
        let data = meta_data.try_borrow_data()?;
        let metadata = mpl_token_metadata::state::Metadata::deserialize(&mut &data[..])?;

        let pool_seeds = &[
            b"pool".as_ref(),
            ctx.accounts.seller.to_account_info().key.as_ref(),
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[pool.bump],
        ];

        let pool_signer = &[&pool_seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer (
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_from.to_account_info(),
                to: ctx.accounts.token_to.to_account_info(),
                authority: pool.to_account_info()
            },
            pool_signer
        );
        token::transfer(cpi_ctx, 1)?;
        
        if method == 0 {
            let cpi_ctx = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.seller.to_account_info()
                }
            );

            anchor_lang::system_program::transfer(cpi_ctx, bid.price)?;
        }
        else {

            let creators = metadata.data.creators.unwrap();

            if metadata.mint != mint.to_account_info().key() {
                return Err(error!(CustomError::InvalidMetadata));
            }

            let admin_sol: u64 = (bid.price * MARKET_FEE as u64) / 10000;
            let creators_sol: u64 = (bid.price * metadata.data.seller_fee_basis_points as u64) / 10000;
            let seller_sol: u64 = bid.price - admin_sol - creators_sol;

            if creators.len() != ctx.remaining_accounts.len() {
                return Err(error!(CustomError::InvalidCreator));
            }

            let cpi_ctx = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.seller.to_account_info()
                }
            );

            anchor_lang::system_program::transfer(cpi_ctx, seller_sol)?;

            let cpi_ctx = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.admin.to_account_info()
                }
            );

            anchor_lang::system_program::transfer(cpi_ctx, admin_sol)?;

            let mut i: usize = 0;
            loop {
                if i >= creators.len() {
                    break;
                }

                let creator = &creators[i];
                let a_creator = &ctx.remaining_accounts[i];

                if creator.address != a_creator.to_account_info().key() {
                    return Err(error!(CustomError::InvalidCreator));
                }
                let creator_sol = creators_sol * creator.share as u64 / 100;
                msg!("creator_sol {}", creator_sol);
                let cpi_ctx = CpiContext::new(
                    system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: a_creator.to_account_info()
                    }
                );
        
                anchor_lang::system_program::transfer(cpi_ctx, creator_sol)?;

                i += 1;
            }
        }    
        pool.close(ctx.accounts.seller.to_account_info())?;
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct ListContext<'info> {
    #[account(init, seeds = [b"pool".as_ref(), user.key.as_ref(), mint.key().as_ref()], bump, space = 8 + 32 + 32 + 8 + 4 + 1, payer = user)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = token_from.owner == user.key() && token_from.mint == mint.key())]
    pub token_from: Account<'info, TokenAccount>,
    #[account(mut, constraint = token_to.owner == pool.key() && token_to.mint == mint.key())]
    pub token_to: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}


#[derive(Accounts)]
pub struct UpdateListContext<'info> {
     #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>
}

#[derive(Accounts)]
pub struct CancelListContext<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = token_from.owner == pool.key() && token_from.mint == mint.key())]
    pub token_from: Account<'info, TokenAccount>,
    #[account(mut, constraint = token_to.owner == user.key() && token_to.mint == mint.key())]
    pub token_to: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct BuyContext<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    /// CHECK: it's not dangerous
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    pub mint: Account<'info,Mint>,
    /// CHECK: it's not dangerous
    pub metadata: AccountInfo<'info>,
    #[account(mut, constraint = token_from.owner == pool.key() && token_from.mint == mint.key())]
    pub token_from: Account<'info, TokenAccount>,
    #[account(mut, constraint = token_to.owner == buyer.key() && token_to.mint == mint.key())]
    pub token_to: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreateBidContext<'info> {
    #[account(init, seeds=[b"bid".as_ref(), bidder.key().as_ref(), mint.key().as_ref(), token_account.key().as_ref()], bump, payer = bidder, space = 8 + 32 + 32 + 32 + 8 + 1)]
    pub bid: Account<'info, Bid>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    /// CHECK: it's not a dangerous
    pub seller: AccountInfo<'info>,
    #[account(mut)]
    pub vault: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateBidContext<'info> {
    #[account(mut, constraint = bid.bidder == bidder.key())]
    pub bid: Account<'info, Bid>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub seller: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    #[account(mut)]
    pub vault: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct CancelBidContext<'info> {
    #[account(mut, constraint = bid.bidder == bidder.key())]
    pub bid: Account<'info, Bid>,
    #[account(mut)]
    pub vault: Signer<'info>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AcceptBidContext<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut, constraint = bid.bidder == bidder.key())]
    pub bid: Account<'info, Bid>,
    #[account(mut)]
    pub vault: Signer<'info>,
    #[account(mut)]
    pub seller: Signer<'info>,
    /// CHECK it's not dangerous
    #[account(mut)]
    pub bidder: AccountInfo<'info>,
    #[account(mut, constraint = admin.key() == ADMIN_KEY)]
    pub admin: Signer<'info>,
    pub mint: Account<'info, Mint>,
    /// CHECK: it's not dangerous
    pub metadata: AccountInfo<'info>,
    #[account(mut, constraint = token_from.owner == pool.key() && token_from.mint == mint.key())]
    pub token_from: Account<'info, TokenAccount>,
    #[account(mut, constraint = token_to.owner == bidder.key() && token_to.mint == mint.key())]
    pub token_to: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>
}

#[account]
pub struct Pool {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub start_time: u32,
    pub bump: u8
}

#[account]
pub struct Bid {
    pub bidder: Pubkey,
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub price: u64,
    pub bump: u8
}

#[error_code]
pub enum CustomError {
    #[msg("Invalid User.")]
    InvalidUser,
    #[msg("Invalid Metadata.")]
    InvalidMetadata,
    #[msg("Invalid Creator.")]
    InvalidCreator,
    #[msg("Wrong Price.")]
    WrongPrice
}