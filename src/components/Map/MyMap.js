import React, { useState, useEffect } from 'react'
import { Map, Marker, GeoJson, GeoJsonFeature, ZoomControl } from 'pigeon-maps'
import haversine from 'haversine-distance'

import DatePick from '../DatePick/DatePick'
import Button from '../Button/Button'

import classes from './MyMap.module.css'

const MyMap = () => {
  const [data, setData] = useState([])
  const [center, setCenter] = useState([58.2935, 26.5353])
  const [zoom, setZoom] = useState(10)
  const [active, setActive] = useState([])
  const [line, setLine] = useState()
  const [distance, setDistance] = useState()
  const color = 'rgb(82,129,224)'
  const activeColor = 'rgb(153,51,51)'
  const [points, setPoints] = useState([])

  const [start, setStart] = useState(new Date('2015-01-01 00:00:00'))
  const [end, setEnd] = useState(new Date('2017-01-01 00:00:00'))

  const genPoints = () => {
    if (active.length !== 2) {
      setLine()
      setDistance()
    }
    const list = []
    data.forEach((point) => {
      const created = new Date(point.date_created)
      if (created >= start && created <= end) {
        const markColor = active.includes(point.id) ? activeColor : color
        const mark = (
          <Marker
            style={{ zIndex: active.includes(point.id) ? 100 : 1 }}
            width={50}
            anchor={[point.lat, point.lng]}
            color={markColor}
            onClick={() => selectPoint(point.id)}
          ></Marker>
        )
        list.push(mark)
      }
    })
    setPoints(list)
  }

  const selectPoint = (id) => {
    if (active.includes(id)) {
      const newActive = active.filter((e) => e !== id)
      setActive(newActive)
    } else {
      setActive([...active, id])
    }
  }

  const getData = () => {
    fetch('data.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (myJson) {
        setData(myJson)
      })
  }

  const calcHandler = () => {
    const a = data.filter((item) => item.id === active[0])[0]
    const b = data.filter((item) => item.id === active[1])[0]

    const posA = { lat: a.lat, lng: a.lng }
    const posB = { lat: b.lat, lng: b.lng }

    const lineGeomFeature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [a.lng, a.lat],
          [b.lng, b.lat]
        ]
      },
      properties: { title: (haversine(posA, posB) / 1000).toFixed(2) + ' Km' }
    }
    const lineGeom = () => {
      return (
        <GeoJson
          style={{ zIndex: 100 }}
          svgAttributes={{
            strokeWidth: '4',
            stroke: activeColor
          }}
        >
          <GeoJsonFeature feature={{ ...lineGeomFeature }} />
        </GeoJson>
      )
    }
    setDistance((haversine(posA, posB) / 1000).toFixed(2) + ' Km')
    setLine(lineGeom)
  }

  useEffect(() => {
    if (data.length === 0) {
      getData()
    }
  })

  // render only points fitting the timeframe and clear selected not to have hidden selected points
  useEffect(() => {
    setActive([])
    genPoints()
  }, [start, end])

  useEffect(() => {
    genPoints()
  }, [active, data])

  console.log('render')

  return (
    <div>
      <div className={classes.Wrapper}>
        <div className={classes.Picker}>
          <div className={classes.Pick}>
            <DatePick onChange={setStart} value={start} name="Start time" />
          </div>
          <div className={classes.Pick}>
            <DatePick onChange={setEnd} value={end} name="End time" />
          </div>
          <div className={classes.Pick}>
            {active.length === 2
              ? (
                <Button onClick={calcHandler} text="Distance"></Button>
                )
              : null}
          </div>
          <div className={classes.Pick}>
            <span className={classes.Dist}>{distance}</span>
          </div>
        </div>
      </div>
      <div id="mapDiv">
        <Map
          width={window.innerWidth}
          height={window.innerHeight}
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setZoom(zoom)
            setCenter(center)
          }}
        >
          {[points]}
          {line}
          <ZoomControl style={{ zIndex: 2000 }} />
        </Map>
      </div>
    </div>
  )
}

export default MyMap
