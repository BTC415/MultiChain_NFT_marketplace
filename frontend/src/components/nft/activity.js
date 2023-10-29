export default ({ activity, activityMonths, activityDays, activityHour, activityMinute }) => {
    return <div className="activity-item" >
        <div className='activity-img' >
            <img src={require('../../images/activity-img.png')} />
        </div>
        <div className='activity-content' >
            <div className='activity-top' >
                <div className='activity-top-left' >
                    {
                        activity.type === 5 ?
                            <p className='address' >
                                {activity.from?.substr(0, 6) + '...' + activity.from?.substr(activity.from.length - 4, 4)}
                            </p>
                            :
                            <p className='address' >
                                {activity.to?.substr(0, 6) + '...' + activity.to?.substr(activity.to.length - 4, 4)}
                            </p>
                    }

                    {
                        activity.type === 1 &&
                        <p className='status-type' >has listed their item</p>
                    }
                    {
                        activity.type === 2 &&
                        <p className='status-type' > has delisted their item</p>
                    }
                    {
                        activity.type === 3 &&
                        <p className='status-type' > has updated their item</p>
                    }
                    {
                        activity.type === 4 &&
                        <p className='status-type' > has bought the item</p>
                    }
                    {
                        activity.type === 5 &&
                        <p className='status-type' >has bid their item</p>
                    }
                    {
                        activity.type === 6 &&
                        <p className='status-type' >has updateed their bid</p>
                    }
                    {
                        activity.type === 7 &&
                        <p className='status-type' >has cancelled their bid</p>
                    }
                    {
                        activity.type === 8 &&
                        <p className='status-type' >has accept their bid</p>
                    }
                </div>
                <p className='price' > {activity.price} SOL</p>
            </div>
            <div className='activity-bottom' >
                {
                    activityDays > 30 ?
                        activityMonths.length > 1 ?
                            <p>{activityMonths} months ago </p>
                            :
                            <p>{`a month ago`} </p>
                        :
                        activityHour > 24 ?
                            <p> {activityDays} days ago </p>
                            :
                            activityMinute >= 60 ?
                                <p> {activityHour}  hours ago </p>
                                : activityMinute >= 1 ?

                                    <p>{activityMinute} Minutes ago </p>
                                    :
                                    <p> less than a minute </p>
                }
            </div>
        </div>
    </div>
}