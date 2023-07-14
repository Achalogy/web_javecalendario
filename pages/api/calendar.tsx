import { NextApiRequest, NextApiResponse } from "next"
import generate_icalendar from "src/generate_icalendar"
import getBrowser from "src/getBrowser"
import stream from "stream"
import { promisify } from "util"

const pipeline = promisify(stream.pipeline)

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(req.method != "POST") return res.status(404).end("Not Found");

  const { content } = req.body

  if(!content) return res.status(400).end("Send HTML")

  const browser = await getBrowser()

  const page = await browser.newPage()

  await page.setContent(content)

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

      return {
        code: tbody.firstChild?.textContent?.split(" - ")[0],
        name: tbody.firstChild?.textContent?.split(" - ")[1],
        clases: clases.map(c => {
          let _num_clase = c.querySelector("td")?.textContent?.trim()
          let _section = c.querySelector("td:nth-child(2)")?.textContent?.trim()
          let _component = c.querySelector("td:nth-child(3)")?.textContent?.trim()

          const [start_date, end_date] = (c.querySelector("td:nth-child(7)")?.textContent?.trim())?.split(" - ") ?? []

          return {
            num_clase: _num_clase ?? num_clase,
            section: _section ?? section,
            component: _component ?? component,
            date: c.querySelector("td:nth-child(4)")?.textContent?.trim(),
            classroom: c.querySelector("td:nth-child(5)")?.textContent?.trim(),
            teacher: c.querySelector("td:nth-child(6)")?.textContent?.trim(),
            start_date,
            end_date
          }
        })
      }
    }))

  })

  if (!data) return res.status(400).end("INVALID")

  const calendar = generate_icalendar(data)

  res.setHeader('Content-Type', 'application/ical')
  res.setHeader('Content-Disposition', 'attachment; filename=generated.ical')

  await pipeline(calendar, res)

  page.close()

}