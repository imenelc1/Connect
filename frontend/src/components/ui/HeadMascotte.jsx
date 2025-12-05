import Mascotte from "../../assets/6.svg"

export default function HeadMascotte() {
    return (
      <img src={Mascotte} alt="Mascotte" className="w-10 h-10 hidden sm:block" />
    )
}