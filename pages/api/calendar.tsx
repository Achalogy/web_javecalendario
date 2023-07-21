import { NextApiRequest, NextApiResponse } from "next"
import generate_icalendar from "src/generate_icalendar"
import getBrowser from "src/getBrowser"
import stream from "stream"
import { promisify } from "util"

const pipeline = promisify(stream.pipeline)

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method != "POST") return res.status(404).end("Not Found");

  const { page1, page2 } = req.body

  if (!page1 || !page2) return res.status(400).end("Send HTML")
  const browser = await getBrowser()

  const page = await browser.newPage()

  await page.setContent(page1)

  let details: any[] = await page?.evaluate((): any => {
    const trs = Array.from(
      document?.querySelectorAll("#ACE_width > tbody > tr:nth-child(10) > td:nth-child(2) > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > div > table > tbody > tr > td > table > tbody > tr") ?? []
    ).slice(1)

    return trs.map(tr => {
      const [line, raw] = (tr.querySelector("td:nth-child(1)")?.textContent ?? "0-0(0)").split("-")
      const [section, code] = raw.replaceAll(/[\(\)]/g, " ").replaceAll(/\s{1,}/g, " ").trim().split(" ")
      const name = tr.querySelector("td:nth-child(2)")?.textContent ?? ""

      return {
        line: line.trim(),
        code: code.trim(),
        section: section.trim(),
        name: name.trim(),
        clases: []
      }
    })
  })

  await page.setContent(page2)

  const data = await page.evaluate((): any => {
    const tbodys = Array.from(
      document?.querySelectorAll("#ACE_width > tbody > tr:nth-child(10) > td:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > div > table > tbody") ?? []
    )

    if (!tbodys.length) return


    return (tbodys.map((tbody, i) => {

      const clases = Array.from(
        tbody.querySelectorAll("tr:nth-child(3) > td:nth-child(2) > div > table > tbody > tr > td > table > tbody > tr")
      ).slice(1)

      let num_clase = ""
      let section = ""
      let component = ""

      return clases.map(c => {
        let _num_clase = c.querySelector("td")?.textContent?.trim()
        let _section = c.querySelector("td:nth-child(2)")?.textContent?.trim()
        let _component = c.querySelector("td:nth-child(3)")?.textContent?.trim()

        if(_num_clase && _num_clase != "") {
          num_clase = _num_clase
        }
        if(_section && _section != "") {
          section = _section
        }
        if(_component && _component != "") {
          component = _component
        }

        const [start_date, end_date] = (c.querySelector("td:nth-child(7)")?.textContent?.trim())?.split(" - ") ?? []

        return {
          num_clase: num_clase ?? _num_clase,
          section: section ?? _section,
          component: component ?? _component,
          date: c.querySelector("td:nth-child(4)")?.textContent?.trim(),
          classroom: c.querySelector("td:nth-child(5)")?.textContent?.trim(),
          teacher: c.querySelector("td:nth-child(6)")?.textContent?.trim(),
          start_date,
          end_date
        }
      })
    }))

  })

  data.flat().map((clase: any) => {
    const i = details.findIndex((d: any) => d.code == clase.num_clase && d.section == clase.section)
    details[i].clases.push(clase)
  })

  if (!data || !details) return res.status(400).end("INVALID")

  const calendar = generate_icalendar(details)

  res.setHeader('Content-Type', 'application/ical')
  res.setHeader('Content-Disposition', 'attachment; filename=generated.ical')

  await pipeline(calendar, res)

  page.close()

}