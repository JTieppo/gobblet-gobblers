export default function Recomend(){
    return(
        <div className="w-full min-h-screen flex flex-col">
            <h1 className="text-xl mx-auto max-w-[500px] mt-2 text-red-600">O software utiliza de cookies para funcionar corretamente, é vital que seja testado em navegadores diferentes ou mesmo máquinas</h1>
            <p className="max-w-[500px] mx-auto">caso tenha problemas durante a depuração clique em limpar, pare de executar o servidor com ctrl + c e rode novamente, isso irá limpar os cookies e rodar a aplicação como nova</p>
            <p className="max-w-[500px] mx-auto text-yellow-500">Certifique-se de fazer isso em ambos os navegadores</p>
        </div>
    )
}