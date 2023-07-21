export interface IClase {
  line: string;
  code: string;
  section: string;
  name: string;
  clases: {
    num_clase: string;
    section: string;
    component: string;
    date: string;
    classroom: string;
    teacher: string;
    start_date: string;
    end_date: string;
  }[]
}