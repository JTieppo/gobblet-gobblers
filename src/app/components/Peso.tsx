import { PesosProps } from "@/interfaces/PesosProps"


export default function Peso({ peso, tipo, informativo, quantidade, selected }: PesosProps) {
    return (
        <div className={`${tipo == "" ? "hidden" : "flex"} ${peso == 0 ? "bg-transparent" : peso == 1 ? tipo == "square" ? "w-14 h-14 bg-blue-300 rounded-lg" : "bg-red-300 w-14 h-14 rounded-full" : peso == 2 ? tipo == "square" ? "w-20 h-20 bg-blue-500 rounded-lg" : "bg-red-500 w-20 h-20 rounded-full" : tipo == "square" ? "w-24 h-24 bg-blue-700 rounded-lg" : "bg-red-700 w-24 h-24 rounded-full"} ${selected ? "border-2" : ""} relative mx-auto my-auto`}>
            <p className={`mx-auto my-auto text-2xl text-black`}>
                {peso != 0 ? peso : ""}
                <sup className={`${informativo ? "-mr-1" : "hidden"} ml-auto  mt-1`}>
                    {quantidade}
                </sup>
            </p>
        </div>
    )
}