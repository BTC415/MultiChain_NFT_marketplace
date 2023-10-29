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
    name: '1',
    uv: 22,
     
  },
  {
    name: '2',
    uv: 23,
    
  },
  {
    name: '3',
    uv: 30,
    
  },
  {
    name: '4',
    uv: 25,
    
  },
  {
    name: '5',
    uv: 28,
   
  },
  {
    name: '6',
    uv: 32,
    
  },
  {
    name: '7',
    uv: 50,
    
  },
  {
    name: '8',
    uv: 40,
     
  },
  {
    name: '9',
    uv: 50,
    
  },
  {
    name: '10',
    uv: 60,
    
  },
  {
    name: '11',
    uv: 30,
    
  },
  {
    name: '12',
    uv: 40,
    
  },
  {
    name: '13',
    uv: 20,
     
  },
  {
    name: '14',
    uv: 40,
    
  },
  {
    name: '15',
    uv: 60,
     
  },
  {
    name: '16',
    uv:55,
    
  },
  {
    name: '17',
    uv: 50,
    
  },
  {
    name: '18',
    uv: 40,
    
  },
  {
    name: '19',
    uv: 30,
   },
  {
    name: '20',
    uv: 60,
   },
  {
    name: '21',
    uv: 55,
   },
  {
    name: '22',
    uv: 50,
   },
  {
    name: '23',
    uv: 60,
   },
   
  {
    name: '24',
    uv: 40,
    
  },
  {
    name: '25',
    uv: 60,
     
  },
  {
    name: '26',
    uv:55,
    
  },
  {
    name: '27',
    uv: 50,
    
  },
  {
    name: '28',
    uv: 40,
    
  },
  {
    name: '29',
    uv: 30,
   },
  {
    name: '30',
    uv: 60,
   },
  {
    name: '31',
    uv: 55,
   },
  {
    name: '50',
    uv: 50,
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
          tickLine={false} axisLine={true} dataKey="name"  ticks={["10", "15", "20","25", "30", "35","40","45","50",">55"]} />
        <YAxis yAxisId="left" stroke='#757575' domain={[10, 60]} ticks={[10, 20, 30, 40, 50, 60]} fontSize={13} tickMargin={21} tickLine={false} axisLine={true} />
 
        <Tooltip  cursor={{fill: '#131313'}}/>
       
          <Bar  yAxisId="left" dataKey="uv" name='Floor Price' stroke="#50FAF0" fill='#50FAF0' barCategoryGap="1%" />
         
        </BarChart>
    </ResponsiveContainer>
  );

}

export default Chart;