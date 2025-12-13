import Mascotte from "../../assets/head_mascotte.svg"

export default function HeadMascotte() {
    return (
      <img src={Mascotte} alt="Mascotte" className="w-10 h-10 hidden sm:block" />
    )
}