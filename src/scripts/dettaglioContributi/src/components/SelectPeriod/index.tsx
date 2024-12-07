import React, { useEffect, useState } from "react";
import { set, sub } from "date-fns";

export type Period = {
  label: string
  from: Date
}

type SelectPeriodProps = {
  onClick?: (period: Period) => void
}

const styles: Record<string, React.CSSProperties> = {
  span: {
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  selected: {
    backgroundColor: '#0C479D',
    color: 'white'
  }
}

const now = new Date()

const periods: Period[] = [
  {
    label: '1M',
    from: sub(now, { months: 1 }),
  },
  {
    label: '3M',
    from: sub(now, { months: 3 }),
  },
  {
    label: '6M',
    from: sub(now, { months: 6 }),
  },
  {
    label: '1A',
    from: sub(now, { years: 1 }),
  },
  {
    label: `${new Date().getFullYear()}`,
    from: set(now, { month: 0, date: 1, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
  {
    label: 'MAX',
    from: set(now, { year: 1900, month: 1, date: 1, minutes: 0, seconds: 0, milliseconds: 0 }),
  }
]

const getStyle = (selected: boolean) => {
  return {
    ...styles.span,
    ...(selected ? styles.selected : {})
  }
}

const SelectPeriod = ({ onClick }: SelectPeriodProps): React.ReactNode => {
  const [selected, setSelected] = useState<string>('MAX')

  useEffect(() => {
    const period = periods.find(period => period.label === selected)!
    handleClick(period)
  }, [])

  const handleClick = (period: Period) => {
    setSelected(period.label)
    if (onClick) onClick(period)
  }


  return (
    <div>
      {periods.map((period, i) => <span onClick={() => handleClick(period)} style={getStyle(selected === period.label)} key={i}>{period.label}</span>)}
    </div>
  )
}

export default SelectPeriod