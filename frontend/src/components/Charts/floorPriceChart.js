import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import Icons from '../Global/Icons';
import commonService from '../../config/services/common.service';
import { MARKETPLACES_API } from '../../config';



const Chart = ({ name }) => {
  const [getFloorData, setFloorData] = useState()

  const [chartTimestamp, setChartTimeStamp] = useState()

  const chartDataField = {
    series: [
      {
        name: 'Floor',
        type: 'area',
        data: getFloorData?.map((chart) => {
          return chart;
        })
      },
    ],
    options: {
      chart: {
        width: '100% !important',
        height: 350,
        toolbar: {
          show: false,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: []
          },
          export: {
            csv: {
              filename: undefined,
              columnDelimiter: ',',
              headerCategory: 'category',
              headerValue: 'value',
              dateFormatter(timestamp) {
                return new Date(timestamp).toDateString()
              }
            },
            svg: {
              filename: undefined,
            },
            png: {
              filename: undefined,
            }
          },
          autoSelected: 'zoom'
        },
      },
      colors: ['#50faf0'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: "light",
          // shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0,
          stops: [0, 100]
        }
      },
      stroke: {
        width: 2.5,
        // curve: 'smooth'
      },
      grid: {
        show: false,
        xaxis: {
          lines: {
            show: false
          }
        },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: [
        {
          labels: {
            style: {
              colors: "#50faf0"
            }
          },
          title: {
            style: {
              color: "#50faf0"
            }
          },
          formatter: function (y) {
            return y.toFixed(0);
          },
          // min: yaxisFloor.min,
          // max: yaxisFloor.max,
          tickAmount: 4
        },
      ],
      xaxis: {
        type: 'datetime',
        categories: chartTimestamp?.map(item => item),
        labels: {
          rotate: -20,
          rotateAlways: true,
          style: {
            fontSize: `12px`,
            fontWeight: 700,
            cssClass: 'apexcharts-xaxis-custom',
            color: 'rgb(0, 227, 150)'
          }
        },
        group: {
          style: {
            colors: [`grey`]
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        markers: {
          width: 8,
          height: 8,
          radius: 24
        },
        onItemHover: {
          highlightDataSeries: false
        },
        labels: {
          colors: ['red', 'yellow']
        }
      },
      tooltip: {
        theme: false
      },
      responsive: [{
        breakpoint: 540,
        options: {
          yaxis: {
            show: false
          }
        }
      }],
    },
  }

  useEffect(() => {
    (
      async () => {
        try {
          const get_Data = await commonService({
            method: 'GET',
            route: `${MARKETPLACES_API.GET_COLLECTION_DATA}${name}/marketgraph`
          })
          const timestamp_last = get_Data.timestamps[get_Data.timestamps.length - 1]
          let timestamps = []
          const start = timestamp_last - 86400000 * 30 * 6
          const filters = get_Data.timestamps.filter((item) => item > start);
          for (let i = 0; i < filters.length; i++) {
            timestamps.push(filters[i])
          }
          setChartTimeStamp(timestamps)

          let floor_value = []
          const index_period = get_Data.timestamps.findIndex((item) => item > start);
          for (let i = index_period; i < get_Data.floorValues.length; i++) {
            floor_value.push(get_Data.floorValues[i])
          }
          setFloorData(floor_value)

        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  return (
    <div className='floorchart-col'>
      <div className='flexBox head-floorchart'>
        <div className='d-flex align-items-center' >
          <div className='mx-2'><Icons name={60} /></div>
          <h5>Floor Price Chart</h5>
        </div>
        <div>
          <p>Last 6 months</p>
        </div>
      </div>

      <div className='floorChart-control' >
        {
          getFloorData ?
            <ReactApexChart
              options={chartDataField.options}
              series={chartDataField.series}
              type="area"
              width={`100%`}
              height={330}
            />
            :
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <p style={{ width: `90%`, margin: `0 auto` }} >
                <Skeleton count={1} style={{ minHeight: `300px` }} />
              </p>
            </SkeletonTheme>
        }
      </div>

    </div>
  );

}

export default Chart;