export interface GameProps {
    prototype: string;
    value: Array<{
        ids: number[],
        tabuleiroPesos: number[],
        tabuleiroTipos: string[]
    }>

}