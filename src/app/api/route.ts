import { NextResponse } from "next/server";


const partidas = new Map();
let n_id_players = 0;
let n_partidas_atuais = 0;

// ================================ GET ===============================
export async function GET() {
    n_id_players++;
    let newpartidaSelectId = "";

    if (n_partidas_atuais === 0) {
        partidas.set("partida1", {
            ids: [n_id_players],
            tabuleiroPesos: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            tabuleiroTipos: ["", "", "", "", "", "", "", "", ""],
            turn: n_id_players,
        });
        newpartidaSelectId = "partida1";
        n_partidas_atuais++;
    } else {
        for (let [chave, valor] of partidas) {
            if (valor.ids.length === 1) {
                partidas.set(chave, {
                    ...valor,
                    ids: [valor.ids[0], n_id_players],
                });
                newpartidaSelectId = chave;
                break;
            }
        }
    }

    return NextResponse.json({ id: n_id_players, gameId: newpartidaSelectId, turn: n_id_players });
}

// ================================ POST ===============================
export async function PUT(req: Request) {
    const { id, gameId, position, jogada } = await req.json();
    const partida = partidas.get(gameId);

    if (!partida) {
        return NextResponse.json({ success: false, message: "Partida não encontrada." });
    }

    if (partida.turn !== id) {
        return NextResponse.json({ success: false, message: "Ainda não é sua vez, aguarde!" });
    }

    if (partida.tabuleiroPesos[position] >= jogada) {
        return NextResponse.json({ success: false, message: "Jogada inválida, escolha uma peça maior." });
    }

    // Atualizar o tabuleiro
    const newTipos = [...partida.tabuleiroTipos];
    const newPesos = [...partida.tabuleiroPesos];

    newTipos[position] = id % 2 === 0 ? "square" : "circle";
    newPesos[position] = jogada;

    // Atualizar o turno
    const nextTurn = partida.ids.find((playerId: number) => playerId !== id);

    partidas.set(gameId, {
        ...partida,
        tabuleiroTipos: newTipos,
        tabuleiroPesos: newPesos,
        turn: nextTurn,
    });

    return NextResponse.json({ success: true, tabuleiroTipos: newTipos, tabuleiroPesos: newPesos });
}




export async function POST(req: Request) {
    const { gameId } = await req.json();
    if (!gameId) {
        return NextResponse.json({ refresh: true })
    } else {
        const vitoria = verificaVitoria(partidas.get(gameId).tabuleiroTipos);
        console.log(vitoria)
        return NextResponse.json({ success: true, tabuleiroTipos: partidas.get(gameId).tabuleiroTipos, tabuleiroPesos: partidas.get(gameId).tabuleiroPesos, turn: partidas.get(gameId).turn, vitoriaBoleano: vitoria.boleano, vitoriaQuem: vitoria.quem })
    }
}

function verificaVitoria(tipos: string[]) {
    let vitoria = false;
    let tipo = "";

    // Verificar linhas
    if (tipos[0] === tipos[1] && tipos[1] === tipos[2] && tipos[0] !== "") {
        vitoria = true;
        tipo = tipos[0];
    }
    if (tipos[3] === tipos[4] && tipos[4] === tipos[5] && tipos[3] !== "") {
        vitoria = true;
        tipo = tipos[3];
    }
    if (tipos[6] === tipos[7] && tipos[7] === tipos[8] && tipos[6] !== "") {
        vitoria = true;
        tipo = tipos[6];
    }

    // Verificar colunas
    if (tipos[0] === tipos[3] && tipos[3] === tipos[6] && tipos[0] !== "") {
        vitoria = true;
        tipo = tipos[0];
    }
    if (tipos[1] === tipos[4] && tipos[4] === tipos[7] && tipos[1] !== "") {
        vitoria = true;
        tipo = tipos[1];
    }
    if (tipos[2] === tipos[5] && tipos[5] === tipos[8] && tipos[2] !== "") {
        vitoria = true;
        tipo = tipos[2];
    }

    // Verificar diagonais
    if (tipos[0] === tipos[4] && tipos[4] === tipos[8] && tipos[0] !== "") {
        vitoria = true;
        tipo = tipos[0];
    }
    if (tipos[2] === tipos[4] && tipos[4] === tipos[6] && tipos[2] !== "") {
        vitoria = true;
        tipo = tipos[2];
    }

    return { boleano: vitoria, quem: tipo };
}