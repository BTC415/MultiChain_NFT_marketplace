
import { useEffect, useState } from 'react';
import ReactApexChart from "react-apexcharts";
import commonService from '../../../config/services/common.service';
import './index.scss'
import { MARKETPLACES_ETH_API } from '../../../config/ether';

let globalPeriod = '24H';

const EtherChart = ({ symbol }) => {
  const [getTimestamp, setTimeStamp] = useState([])
  const [getFloorData, setFloorData] = useState()

  const [chartTimestamp, setChartTimeStamp] = useState([])
  const [chartData, setChartData] = useState({
    floor: [],
    listing: [],
    volume: []
  })

  const [isPeriodActive, setPeriodActive] = useState(1)

  const [period, setPeriod] = useState(`24H`)

  const [chartItemTimestamp, setChartItemTimestamp] = useState({
    sixH: [],
    day: [],
    week: [],
    month: [],
    threeMonths: [],
    year: [],
    all: []
  })

  const [chartItemData, setChartItemData] = useState({
    floor: [],
    listing: [],
    volume: []
  })

  const periodLists = [
    { name: `6H` },
    { name: `24H` },
    { name: `7D` },
    { name: `30D` },
    { name: `3M` },
    { name: `1Y` },
    { name: `All` },
  ]

  const chartDataField = {
    series: [
      {
        name: 'Floor',
        type: 'area',
        data: chartData?.floor.map((chart) => {
          return chart;
        })
      },
      {
        name: 'Listing',
        type: 'area',
        data: chartData?.listing.map((chart) => {
          return chart;
        })
      },
      {
        name: 'Volume',
        type: 'area',
        data: chartData?.volume.map((chart) => {
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
      colors: ['#50faf0', '#FACA50', '#8A8988'],
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
            align: 'left',
            style: {
              colors: "#B4B4B4"
            }
          },
          title: {
            text: `Floor Price(SOL)`,
            style: {
              color: "#B4B4B4",
              fontSize: `14px`
            }
          },

          formatter: function (y) {
            return y.toFixed(0);
          },
          // min: yaxisFloor.min,
          // max: yaxisFloor.max,
          tickAmount: 4
        },
        {
          opposite: true,
          labels: {
            align: 'right',
            style: {
              colors: "#B4B4B4",
              cssClass: 'listingcharts-yaxis-label'
            }
          },
          title: {
            text: `Listings`,
            style: {
              color: "#B4B4B4",
              fontSize: `14px`

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
        categories: chartTimestamp?.map((item) => item),
        labels: {
          rotate: 0,
          rotateAlways: true,
          style: {
            fontSize: `12px`,
            textTransform: `rotate(45deg)`,
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
        horizontalAlign: 'left',
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

  const handleClickItem = (idx) => {
    if (idx === 0 || idx) {
      setPeriodActive(idx)
    }

    const timestamp_last = getTimestamp[getTimestamp?.length - 1];

    const floor_chart = getFloorData.floorValues
    const listing_chart = getFloorData.listingValues
    const volume_chart = getFloorData.volumeValues

    let period_index;

    switch (idx) {
      case 0:
        setPeriod('6H');
        let sixTimestamp = [];
        const sixStart = timestamp_last - 3600000 * 6
        const filters_six = getTimestamp.filter((item) => item > sixStart)

        for (let i = 0; i < filters_six.length; i++) {
          sixTimestamp.push(filters_six[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          sixH: sixTimestamp
        })

        period_index = getTimestamp.findIndex((item) => item > sixStart);

        break;
      case 1:
        setPeriod('24H');

        let dayTimestamp = [];
        const start = timestamp_last - 86400000
        const filters = getTimestamp.filter((item) => item > start)

        for (let i = 0; i < filters.length; i++) {
          dayTimestamp.push(filters[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          day: dayTimestamp
        })

        period_index = getTimestamp.findIndex((item) => item > start)

        break;
      case 2:
        setPeriod('7D');
        let weekTimeStamp = [];
        const start_week = timestamp_last - 86400000 * 7
        const filters_week = getTimestamp.filter((item) => item > start_week)

        for (let i = 0; i < filters_week.length; i++) {
          weekTimeStamp.push(filters_week[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          week: weekTimeStamp
        })

        period_index = getTimestamp.findIndex((item) => item > start_week)

        break;
      case 3:
        setPeriod('30D');

        let monthTimestamp = [];
        const start_month = timestamp_last - 86400000 * 30
        const filters_month = getTimestamp.filter((item) => item > start_month)
        for (let i = 0; i < filters_month.length; i++) {
          monthTimestamp.push(filters_month[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          month: monthTimestamp
        })

        period_index = getTimestamp.findIndex((item) => item > start_month)

        break;
      case 4:
        setPeriod('3M');
        let threeMonths = [];
        const start_three = timestamp_last - 86400000 * 30 * 3
        const filters_three = getTimestamp.filter((item) => item > start_three)
        for (let i = 0; i < filters_three.length; i++) {
          threeMonths.push(filters_three[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          threeMonths: threeMonths
        })

        period_index = getTimestamp.findIndex((item) => item > start_three)
        break;
      case 5:
        setPeriod('1Y');
        let yearTimestamp = [];
        const start_year = timestamp_last - 86400000 * 30 * 12
        const filters_year = getTimestamp.filter((item) => item > start_year)
        for (let i = 0; i < filters_year.length; i++) {
          yearTimestamp.push(filters_year[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          year: yearTimestamp
        })

        period_index = getTimestamp.findIndex((item) => item > start_year)
        break;
      case 6:
        setPeriod('All');
        let allTimestamp = [];
        const start_all = getTimestamp[0]
        const filters_all = getTimestamp.filter((item) => item > start_all)
        for (let i = 0; i < filters_all.length; i++) {
          allTimestamp.push(filters_all[i])
        }

        setChartItemTimestamp({
          ...chartItemTimestamp,
          all: allTimestamp
        })

        period_index = getTimestamp.findIndex((item) => item > start_all)
        break;
      default:
        break;
    }

    let data_day_floor = [], data_day_listing = [], data_day_volume = [];
    for (let i = period_index; i < floor_chart.length; i++) {
      data_day_floor.push(floor_chart[i])
    }
    for (let i = period_index; i < listing_chart.length; i++) {
      data_day_listing.push(listing_chart[i])
    }
    for (let i = period_index; i < volume_chart.length; i++) {
      data_day_volume.push(volume_chart[i])
    }
    setChartItemData({
      ...chartItemData,
      floor: data_day_floor,
      listing: data_day_listing,
      volume: data_day_volume
    })
  }

  useEffect(() => {
    (
      async () => {

        globalPeriod = period;
        let result_timestamp = null
        switch (period) {
          case `All`:
            result_timestamp = chartItemTimestamp.all
            break;
          case `1Y`:
            result_timestamp = chartItemTimestamp.year
            break;
          case `3M`:
            result_timestamp = chartItemTimestamp.threeMonths
            break;
          case `30D`:
            result_timestamp = chartItemTimestamp.month
            break;
          case `7D`:
            result_timestamp = chartItemTimestamp.week
            break;
          case `24H`:
            result_timestamp = chartItemTimestamp.day
            break;
          case `6H`:
            result_timestamp = chartItemTimestamp.sixH
            break;
          default:
            break;
        }
        setChartTimeStamp(result_timestamp)
        setChartData({
          ...chartData,
          floor: chartItemData.floor,
          listing: chartItemData.listing,
          volume: chartItemData.volume,
        })
      }
    )()
  }, [period, chartItemData.floor])

  useEffect(() => {
    (
      async () => {
        try {
          const get_Data = await commonService({
            method: 'GET',
            route: `${MARKETPLACES_ETH_API.GET_COLLECTION}/${symbol}/marketgraph`
          })
          setFloorData(get_Data)
          setTimeStamp(get_Data.timestamps)

          const timestamp_last = get_Data.timestamps[get_Data.timestamps?.length - 1];
          let dayTimestamp = [];
          const start = timestamp_last - 86400000
          const filters = get_Data.timestamps.filter((item) => item > start)

          for (let i = 0; i < filters.length; i++) {
            dayTimestamp.push(filters[i])
          }

          setChartItemTimestamp({
            ...chartItemTimestamp,
            day: dayTimestamp
          })

          const period_index = get_Data.timestamps.findIndex((item) => item > start)

          let data_day_floor = [], data_day_listing = [], data_day_volume = [];
          for (let i = period_index; i < get_Data.floorValues.length; i++) {
            data_day_floor.push(get_Data.floorValues[i])
          }
          for (let i = period_index; i < get_Data.listingValues.length; i++) {
            data_day_listing.push(get_Data.listingValues[i])
          }
          for (let i = period_index; i < get_Data.volumeValues.length; i++) {
            data_day_volume.push(get_Data.volumeValues[i])
          }
          setChartItemData({
            ...chartItemData,
            floor: data_day_floor,
            listing: data_day_listing,
            volume: data_day_volume
          })

        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  return (
    <div className='chart-control' >
      <div className='period-group-control' >
        <div className='period-group' >
          {
            periodLists.map((item, idx) =>
              <div key={idx} className={isPeriodActive === idx ? `period-item-selected` : `period-item`}
                onClick={() => handleClickItem(idx)}
              >{item.name}</div>
            )
          }
        </div>
      </div>
      <ReactApexChart
        options={chartDataField.options}
        series={chartDataField.series}
        type="area"
        width={`100%`}
        height={330}
      />
    </div>
  );

}

export default EtherChart;