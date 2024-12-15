import { useMemo } from "react"

type CircleProps = {
    color: string
}

const Circle = ({ color }: CircleProps): React.ReactNode => {
    const style: React.CSSProperties = useMemo(() => ({
        width: '10px',
        height: '10px',
        backgroundColor: color,
        borderRadius: '50%',
    }), [color])
    return <span style={style}></span>
}

export default Circle