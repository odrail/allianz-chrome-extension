import { lightFormat, parse } from "date-fns";

const formatDateString = 'dd/MM/yyyy'

export const formatDate = (date: Date) => lightFormat(date, formatDateString)
export const parseDate = (textContent: string): Date => 
    parse(textContent.trim(), formatDateString, new Date())