import Icons from "../components/Global/Icons";

const IconsList = () => {
    return (
        <>
            {
                Array.from({ length: 98 }).map((_, index) =>
                    <Icons name={index + 1} />
                )
            }
        </>
    );
}

export default IconsList