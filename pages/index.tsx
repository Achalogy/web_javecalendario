import { useState } from "react"
import { AiOutlineWarning } from 'react-icons/ai'
export default () => {

  const [page1, setPage1] = useState<string>("")
  const [page2, setPage2] = useState<string>("")
  const [browser, setBrowser] = useState<"edge" | "chrome" | "firefox" | undefined>()
  const [error, setError] = useState<boolean>(false)

  const submit = async () => {
    const response = await fetch('/api/calendar', {
      method: "POST",
      body: JSON.stringify({
        page1,
        page2
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (response.status != 200) return setError(true)

    const blobResponse = await (response).blob()

    const url = window.URL.createObjectURL(new Blob([blobResponse]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      'generated.ical'
    )

    document.body.appendChild(link)

    link.click()

    link.parentNode?.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen p-8 text-center xl:w-2/3 mx-auto">
      <h1 className="text-5xl font-semibold text-slate-800">
        Descarga tu <span className="text-indigo-500 font-semibold">Calendario</span> - PUJ
      </h1>
      <div className="flex items-center gap-2 bg-orange-200 p-2 rounded-md text-red-600">
        <AiOutlineWarning size={20} strokeWidth={25} className="hidden xl:flex" />
        <p className="font-semibold">Esta web solo ha sido probada en condiciones controladas, ¡Revisa tu horario, no te confies!</p>
      </div>
      <div className="flex xl:hidden items-center gap-2 bg-red-200 p-2 rounded-md text-red-600">
        <p className="font-semibold">¡Debes usar un Computador para realizar los pasos!</p>
      </div>
      <div className="text-left bg-slate-100 flex flex-col gap-2 p-2 px-3 rounded-md xl:w-3/4">
        <h2 className="font-semibold text-xl mb-2">¿Como Descargar tu calendario usando esta web?</h2>
        <p><b className="text-indigo-500">¡Es posible que tengas que usar otro navegador!</b> Hasta ahora solo ha sido probado con los siguientes navegadores, selecciona el de tu preferencia:</p>
        <div className="flex gap-3 p2 overflow-scroll">
          <button onClick={() => setBrowser("edge")} className="px-3 p-2 rounded-md bg-indigo-200 font-semibold truncate">Microsoft Edge</button>
          <button onClick={() => setBrowser("firefox")} className="px-3 p-2 rounded-md bg-indigo-200 font-semibold truncate">Firefox</button>
          <button onClick={() => setBrowser("chrome")} className="px-3 p-2 rounded-md bg-indigo-200 font-semibold truncate">Chrome</button>
        </div>
        {browser &&
          <div className="flex flex-col gap-3 p-2 rounded-md bg-white">
            <p><b>Primer Paso: </b>Entra acá: <a className="text-indigo-500" target="_blank" href="https://cs.javeriana.edu.co:8443/psc/CS92PRO/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?Page=SSR_SSENRL_CART&Action=A&ACAD_CAREER=PREG&INSTITUTION=PUJAV&STRM=2330">Intranet</a></p>
            <p>Deberia aparecer tu horario en Vistado Listado, ¡No toques nada en la web!, si no te sale tu horario, vuelve a entrar al enlace.</p>
            {
              browser == "edge" ?
                <>
                  <p><b>Segundo Paso: </b> Usa click derecho <span className="font-semibold px-2 p-1 bg-slate-200 rounded-md">Ver el origen de fotograma</span></p>
                </>
                :
                <>
                  <p><b>Segundo Paso: </b> Usa <span className="font-semibold px-2 p-1 bg-slate-200 rounded-md">Ctrl + U</span> o click derecho <span className="font-semibold px-2 p-1 bg-slate-200 rounded-md">Ver código fuente de la página</span></p>
                </>
            }
            <p><b>Tercer Paso: </b> Copia todo el contenido de la pagina que se te abrió. <span className="px-2 p-1 bg-slate-200 rounded-md">{`(deberia iniciar con algo similar a <!DOCTYPE html>)`}</span></p>
            <p><b>Cuarto Paso: </b> Pega el contenido en el siguiente espacio (primero pagina 1 y luego pagina 2) y has click en <span className="font-semibold px-2 p-1 bg-slate-200 rounded-md">Descargar</span></p>
            <p><b>Quito Paso: </b>Entra acá: <a className="text-indigo-500" target="_blank" href="https://cs.javeriana.edu.co:8443/psc/CS92PRO/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL?Page=SSR_SSENRL_LIST&Action=A&ACAD_CAREER=PREG&INSTITUTION=PUJAV&STRM=2330">Intranet</a> y realiza los mismos pasos desde el segundo hasta el cuarto.</p>
            <p><b>Sexto Paso: </b> Investiga como importar un archivo <span className="font-semibold px-2 p-1 bg-slate-200 rounded-md">ical/ics</span> en tu calendario de preferencia, o si usas <span className="font-semibold px-2 p-1 bg-slate-200 rounded-md">google calendar</span> entra <a target="_blank" className="text-indigo-500" href="https://calendar.google.com/calendar/u/0/r/settings/export">acá</a></p>
          </div>
        }
      </div>
      <div className="flex flex-col xl:flex-row gap-4 w-full flex-1">
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-black text-lg tracking-wide">Página 1</p>
          <textarea rows={3} value={page1} onChange={(e) => setPage1(e.target.value)} className="flex-1 bg-slate-200 p-2 rounded-md w-full" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-black text-lg tracking-wide">Página 2</p>
          <textarea rows={3} value={page2} onChange={(e) => setPage2(e.target.value)} className="flex-1 bg-slate-200 p-2 rounded-md w-full" />
        </div>
      </div>
      {error && <div className="flex items-center gap-2 bg-red-200 p-2 rounded-md text-red-600">
        <p>Algo salio mal... Revisa los pasos o reporta el error en <a target="_blank" href="https://github.com/achalogy/web_javecalendario">github</a></p>
      </div>}
      <button disabled={!page1 || !page2} onClick={submit} className="disabled:saturate-0">
        <p className="px-4 p-2 bg-indigo-500 text-white font-semibold text-lg rounded-full">Descargar</p>
      </button>
      <p className="text-base">Creador: <a target="_blank" href="https://achalogy.dev/" className="text-indigo-400">Achalogy</a> - <a target="_blank" className="text-indigo-400" href="https://github.com/achalogy/web_javecalendario">Código Fuente y Reportes</a> </p>
    </div>
  )
}