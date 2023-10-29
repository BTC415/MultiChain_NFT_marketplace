import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, ResponsiveContainer,Area } from 'recharts';

export function ReferenceLabel(props) {
  const {
    fill, value, textAnchor,
    fontSize, viewBox, dy, dx,
  } = props;
  const x = viewBox.x + 20;
  const y = viewBox.y - 6;
  return (
    <>

      <svg x={x + 450} y={y - 45}
        dy={dy}
        dx={dx} width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d)">

          <circle cx="47" cy="47" r="17" fill="white" />
        </g>

        <defs>
          <filter id="filter0_d" x="0" y="0" width="94" height="94" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset />
            <feGaussianBlur stdDeviation="15" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
      <text x={x + 487} y={y + 6}
        dy={dy}
        dx={dx}
        fill={fill}
        fontSize={fontSize || 16}
        textAnchor={textAnchor}>{value}</text>

    </>


  )
}
const data = [
  {
    name: '00:00',
    uv: 10,
     
  },
  {
    name: '01:00',
    uv: 10,
    
  },
  {
    name: '02:00',
    uv: 10,
    
  },
  {
    name: '03:00',
    uv: 10,
    
  },
  {
    name: '04:00',
    uv: 10,
   
  },
  {
    name: '05:00',
    uv: 10,
    
  },
  {
    name: '06:00',
    uv: 10,
    
  },
  {
    name: '07:00',
    uv: 10,
     
  },
  {
    name: '08:00',
    uv: 10,
    
  },
  {
    name: '09:00',
    uv: 10,
    
  },
  {
    name: '10:00',
    uv: 10,
    
  },
  {
    name: '11:00',
    uv: 10,
    
  },
  {
    name: '12:00',
    uv: 10,
     
  },
  {
    name: '13:00',
    uv: 10,
    
  },
  {
    name: '14:00',
    uv: 10,
     
  },
  {
    name: '15:00',
    uv:10
    
  },
  {
    name: '16:00',
    uv: 10,
    
  },
  {
    name: '17:00',
    uv: 10,
    
  },
  {
    name: '18:00',
    uv: 10,
   },
  {
    name: '19:00',
    uv: 10,
   },
  {
    name: '20:00',
    uv: 10,
   },
  {
    name: '21:00',
    uv: 10,
   },
  {
    name: '22:00',
    uv: 10,
   },
];


const Chart = () => {

  return (
    <ResponsiveContainer width="99%" aspect={5.5}>


      <AreaChart 
        width={1080}
        height={228}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
          <defs>
    
    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#50faf01a" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
    </linearGradient>
  </defs>
        <CartesianGrid strokeDasharray="0 0"  vertical={true} stroke="#1D1F1F" />
        <XAxis stroke='#757575' fontSize={13} tickMargin={16} 
          tickLine={false} axisLine={false} dataKey="name" />
        <YAxis stroke='#757575' domain={[10, 60]} ticks={[10, 20, 30, 40, 50, 60]} fontSize={13} tickMargin={21} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend payload={[
          		{ id: 'pv', value: 'Floor Price', type: 'square', color: '#50FAF0'},
           	]} type=""  verticalAlign="top" align="left" />
         {/* <Line   dataKey="uv" name="Heading 2"  stroke="#50FAF0" dot={false} strokeWidth={1} /> */}
          <Area  dataKey="uv" name='Floor Price' stroke="#50FAF0" fillOpacity={1} fill="url(#colorPv)" />

        </AreaChart>
    </ResponsiveContainer>
  );

}

export default Chart;