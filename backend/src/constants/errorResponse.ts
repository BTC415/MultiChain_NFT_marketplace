const ERROR_RESPONSE = {
    ER_400_01:{
        status_code:400,
        message:{
            eng:'Thd request parameters could not be validated'
        }
    },
    ER_400_02:{
        status_code: 400,
        message:{
            eng: 'Incorrect value provided',

        }
    },
    ER_401_01:{
        status_code: 401,
        message:{
            eng: 'The user is not Authorized.',
            
        }
    },
    ER_404_01:{
        status_code: 404,
        message:{
            eng: 'Data not found',
            
        }
    },
    ER_500:{
        status_code: 500,
        message:{
            eng: 'Internal Server Error',
            
        }
    },
    ER_500_01:{
        status_code: 500,
        message:{
            eng: 'Internal Server Error',
            
        }
    },
}

export default ERROR_RESPONSE;