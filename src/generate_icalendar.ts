import ical, { ICalEventRepeatingFreq } from 'ical-generator'
import { IClase } from './interface'

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

export default (clases: IClase[]): string => {
  const cal = ical({
    name: "Javeriana",
    timezone: "America/Bogota",
  })

  clases.map(detalles => {

    detalles.clases.map(clase => {
      const start_date = generateDate(clase.start_date)
      const end_date = generateDate(clase.end_date)

      // Domingo 0 - Lunes 1

      const [dayStr, startHourStr, endHourStr] = clase.date.split(" ").filter(x => x != "-")

      const day = days.findIndex(d => d.includes(dayStr)) + 1

      for (let i = start_date.getTime(); i <= end_date.getTime(); i += 86400000) {
        const d = new Date(i)
        if (d.getDay() == day) {
          d.setHours(parseHours(startHourStr)[0], parseHours(startHourStr)[1])
          const start = new Date(d)
          d.setHours(parseHours(endHourStr)[0], parseHours(endHourStr)[1])
          const end = new Date(d)

          const oldEvent = cal.events().find(x => {
            try {
              return new Date(x.start() as any).getTime() == start.getTime()
            } catch {
              return false
            }
          })

          if (oldEvent) {
            let oldSummary = oldEvent.summary()

            oldEvent.summary(`${clase.component}${clase.component ? " - " : ""}${oldSummary.split(" - ").at(-1)} | ${detalles.name}`)
          } else {
            cal.createEvent({
              start,
              end,
              summary: `${clase.component}${clase.component ? " - " : ""}${detalles.name}`,
              description: `Profesor: ${clase.teacher}`,
              location: clase.classroom,
              repeating: {
                freq: ICalEventRepeatingFreq.WEEKLY,
                until: end_date
              }
            })
          }

          break
        }
      }
    })
  })

  return cal.toString()
  // cal.saveSync("generated.ics")
}


function generateDate(str: string) {
  const str_date = str.split("/")

  const year = +str_date[2];
  const month = +(str_date[1]) - 1;
  const day = +str_date[0];
  return new Date(year, month, day);
}

function parseHours(str: string): number[] {
  const [hours, minutes] = str.split(":").map(x => +x.replace(/[^\d]/g, ""))

  return [
    hours + (str.includes("PM") ? 12 : 0),
    minutes
  ]
}