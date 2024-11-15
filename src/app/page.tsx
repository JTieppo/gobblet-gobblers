"use client";
import Link from "next/link";
import Peso from "./components/Peso";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BiSolidCookie } from "react-icons/bi";


interface PartidaState {
    tabuleiroTipos: string[];
    tabuleiroPesos: number[];
    turn: number;
}

export default function Jogo() {
    const router = useRouter();
    const [tipos, setTipos] = useState<string[]>(["", "", "", "", "", "", "", "", ""]);
    const [pesos, setPesos] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [pesosDisponiveis, setPesosDisponiveis] = useState<number[]>([3, 2, 1]);
    const [pesoAtual, setPesoAtual] = useState<number>(0);
    const [responseMessage, setResponseMessage] = useState<string>("");
    const [mainType, setMainType] = useState<string>("");
    const [turn, setTurn] = useState<number>(0);
    const [vitoria, setVitoria] = useState(false);
    const [quemVenceu, setQuemVenceu] = useState("");
    let intervalId: NodeJS.Timeout | null = null;

    useEffect(() => {
        // Inicializar estado do jogador e partida
        if (!Cookies.get("token_gobblet_gobblers") || !Cookies.get("token_gobblet_game_id")) {
            fetch("/api", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((response) => response.json())
                .then((response: { id: number; gameId: string; turn: number }) => {
                    Cookies.set("token_gobblet_gobblers", String(response.id));
                    Cookies.set("token_gobblet_game_id", response.gameId);
                    setTurn(response.turn);
                    Cookies.set("gobblet_gobblers_turn", String(response.turn));
                    setMainType(response.id % 2 === 0 ? "square" : "circle");
                })
                .catch((err) => console.error("Error fetching data:", err));
        } else {
            setMainType(Number(Cookies.get("token_gobblet_gobblers")) % 2 === 0 ? "square" : "circle");
            setTurn(Number(Cookies.get("gobblet_gobblers_turn")));
        }
    }, []);

    useEffect(() => {
        if (vitoria) {
            // Finalizar o jogo e limpar o intervalo
            if (intervalId) clearInterval(intervalId);
            Cookies.remove("token_gobblet_gobblers");
            Cookies.remove("token_gobblet_game_id");
            Cookies.remove("gobblet_gobblers_turn");
            return;
        }

        // Atualizar o estado do jogo em intervalos regulares
        intervalId = setInterval(() => {
            fetch("/api", {
                method: "POST",
                body: JSON.stringify({
                    id: Number(Cookies.get("token_gobblet_gobblers")),
                    gameId: Cookies.get("token_gobblet_game_id"),
                }),
            })
                .then((response) => response.json())
                .then((response) => {
                    if (response.refresh) {
                        setResponseMessage("Recarregue a página!");
                        setTimeout(() => setResponseMessage(""), 3000);
                    } else {
                        setTipos(response.tabuleiroTipos);
                        setPesos(response.tabuleiroPesos);
                        setTurn(response.turn);
                        if (response.vitoriaBoleano) {
                            setQuemVenceu(response.vitoriaQuem);
                            setVitoria(response.vitoriaBoleano);
                        }
                    }
                })
                .catch((err) => console.error("Erro ao atualizar estado:", err));
        }, 3000);

        // Limpar intervalo ao desmontar o componente
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [vitoria]);

    const handleSetChose = (peso: number, quantidade: number) => {
        if (quantidade > 0) {
            setPesoAtual(peso);
        } else {
            setResponseMessage("Selecione uma peça disponível");
            setTimeout(() => setResponseMessage(""), 3000);
        }
    };

    const handleTryPlay = (position: number) => {
        if (pesoAtual > 0 && turn === Number(Cookies.get("token_gobblet_gobblers"))) {
            if (pesosDisponiveis[pesoAtual - 1] <= 0) {
                setResponseMessage("Essa peça está indisponível, escolha outra!")
            } else {
                fetch("/api", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jogada: pesoAtual,
                        position,
                        id: Number(Cookies.get("token_gobblet_gobblers")),
                        gameId: Cookies.get("token_gobblet_game_id"),
                    }),
                })
                    .then((response) => response.json())
                    .then((response: { success: boolean; message?: string; tabuleiroTipos?: string[]; tabuleiroPesos?: number[] }) => {
                        if (response.success) {
                            if (response.tabuleiroTipos && response.tabuleiroPesos) {
                                setTipos(response.tabuleiroTipos);
                                setPesos(response.tabuleiroPesos);
                                let newPesosDisponiveis: number[] = [];
                                pesosDisponiveis.map((item, index) => {
                                    index == pesoAtual - 1 ?
                                        newPesosDisponiveis.push(pesosDisponiveis[index] - 1)
                                        :
                                        newPesosDisponiveis.push(item)
                                })
                                setPesosDisponiveis(newPesosDisponiveis)
                            }
                            setTurn((prevTurn) =>
                                prevTurn === Number(Cookies.get("token_gobblet_gobblers"))
                                    ? 0
                                    : Number(Cookies.get("token_gobblet_game_id"))
                            );
                        } else if (response.message) {
                            setResponseMessage(response.message);
                            setTimeout(() => setResponseMessage(""), 3000);
                        }
                    })
                    .catch((err) => console.error("Erro durante PUT:", err));
            }
        } else {
            const message =
                position >= 9
                    ? "Escolha o local onde deseja jogar!"
                    : pesoAtual === 0
                        ? "Escolha a peça que irá jogar!"
                        : "Ainda não é sua vez, aguarde!";
            setResponseMessage(message);
            setTimeout(() => setResponseMessage(""), 3000);
        }
    };

    function limparCookies() {
        Cookies.remove("token_gobblet_gobblers");
        Cookies.remove("token_gobblet_game_id");
        Cookies.remove("gobblet_gobblers_turn");
    }

    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="flex w-full justify-between">
                <Link href="/recomend" className="cursor-pointer bg-yellow-500 w-fit p-2 px-4 text-2xl rounded-lg m-2">Recomendações para teste</Link>
                <button onClick={() => limparCookies()} className="cursor-pointer bg-yellow-500 w-fit p-2 px-4 text-2xl rounded-lg m-2 flex items-center gap-2">limpar Cookies <BiSolidCookie /></button>
            </div>

            <div className="flex w-full justify-around mt-2">
                {pesosDisponiveis.map((item, index) => (
                    <button
                        onClick={() => handleSetChose(index + 1, item)}
                        key={index}
                        className="w-24 h-24"
                    >
                        <Peso
                            peso={index + 1}
                            tipo={mainType}
                            quantidade={item}
                            informativo
                            selected={pesoAtual === index + 1}
                        />
                    </button>
                ))}
            </div>

            <div className="my-auto grid grid-cols-3 grid-rows-3 mx-auto">
                {pesos.map((peso, index) => (
                    <button
                        key={index}
                        onClick={() => handleTryPlay(index)}
                        className="w-28 h-28 border flex items-center justify-center"
                    >
                        <Peso peso={peso} tipo={tipos[index]} />
                    </button>
                ))}
            </div>

            {vitoria && (
                <div className="absolute w-full mt-4 flex">
                    <p className="mx-auto rounded-lg p-2 px-4 bg-slate-800 text-white">
                        {quemVenceu === "square" ? "O jogador do quadrado venceu!" : "O jogador do círculo venceu!"}
                    </p>
                </div>
            )}

            {responseMessage && (
                <div className="absolute w-full mt-4 flex">
                    <p className="mx-auto rounded-lg p-2 px-4 bg-slate-800 text-white">{responseMessage}</p>
                </div>
            )}
        </div>
    );
}