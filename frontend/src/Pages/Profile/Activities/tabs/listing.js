import Icons from "../../../../components/Global/Icons"

const Listings = ({ activities }) => {
  return (
    <>
      {
        activities.length > 0 ?
          activities.map((activity, i) => {
            const activityHour = (Number(Date.now() - new Date(activity.created_at).getTime()) / 3600000).toFixed(0); // hour about milisection
            const activityMinute = Number((Number(Date.now() - new Date(activity.created_at).getTime()) / 3600000) * 60).toFixed(0) // Minute about milisection

            return (
              (
                <tr key={i} >
                  <td>
                    <div className="d-flex align-items-center">
                      <img src={activity.image} style={{ width: "80px", height: "80px" }} alt='listing' />
                      <p className="mx-4">{activity.name} </p>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center">
                      <Icons name={1} />
                      <p className="mx-2 sand-a2kewade">{activity.price} SOL</p>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">

                      <p>{activity.signature.slice(0, 4) + '...' + activity.signature.substring(activity.signature.length - 4)}</p>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center"
                      style={{ background: `rgba(250, 202, 80, 0.1)`, maxWidth: `fit-content`, borderRadius: `10px`, padding: `3px 23px`, color: `#FACA50` }}
                    >
                      Listing
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {
                        activityMinute >= 60 ?
                          <p> {activityHour}  hours ago </p>
                          : activityMinute >= 1 ?

                            <p>{activityMinute} Minutes ago </p>
                            :
                            <p> less than a minute </p>
                      }
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">

                      <p>{activity.mintAddress.slice(0, 4) + '...' + activity.mintAddress.substring(activity.mintAddress.length - 4)}</p>
                    </div>
                  </td>
                </tr>)
            )
          })
          :
          <div className='no-nftGroup' >
            <p className='title' >Nothing Found</p>
            <p className='subTitle' >We couldn't find anything with this criteria</p>
          </div>
      }
    </>
  )
}

export default Listings

