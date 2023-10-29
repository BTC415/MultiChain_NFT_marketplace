import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, ResponsiveContainer,Area,Bar,BarChart } from 'recharts';

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
    name: '<5%',
    uv: 11,
    
  },
  {
    name: '5-10%',
    uv: 15,
   
  
  },
  {
    name: '10-15%',
    uv: 15,
     
  },
  {
    name: '15-20%',
    uv: 25,
    
  },
  {
    name: '20-30%',
    uv: 40,
     
  },
  {
    name: '30-40%',
    uv: 20,
     
  },
  {
    name: '40-50%',
    uv: 12,
   
  },
  {
    name: '50-75%',
    uv: 17,
   
  },
  {
    name: '75-100%',
    uv: 20,
    
  },
  {
    name: '>100%',
    uv: 25,
    
  },
  
];


const Chart = () => {

  return (
    <ResponsiveContainer width="99%" aspect={4}>


      <BarChart 
       barCategoryGap={"25%"}
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
  
        {/* <CartesianGrid strokeDasharray="0 0"  vertical={true} stroke="#1D1F1F" /> */}
        <XAxis stroke='#757575' fontSize={13} tickMargin={16} 
          tickLine={false} axisLine={true} dataKey="name" />
        <YAxis yAxisId="left" stroke='#757575' domain={[10, 60]} ticks={[10, 20, 30, 40, 50, 60]} fontSize={13} tickMargin={21} tickLine={false} axisLine={true} />
 
        <Tooltip  cursor={{fill: '#131313'}}/>
       
          <Bar  yAxisId="left" dataKey="uv" name='Floor Price' stroke="#50FAF0" fill='#50FAF0' barCategoryGap="1%" />
         
        </BarChart>
    </ResponsiveContainer>
  );

}

export default Chart;