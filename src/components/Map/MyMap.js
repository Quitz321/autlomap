import React, { useState, useEffect } from 'react'
import { Map, Marker, GeoJson, GeoJsonFeature } from 'pigeon-maps'
import haversine from 'haversine-distance'

import DatePick from '../DatePick/DatePick'
import Button from '../Button/Button'

import classes from './MyMap.module.css'



const MyMap = () => {
  const [data, setData] = useState([]);
  const [center, setCenter] = useState([58.2935, 26.5353])
  const [zoom, setZoom] = useState(10)
  const [status, setStatus] = useState(true);
  const [active, setActive] = useState([]);
  const [line, setLine] = useState();
  const [distance, setDistance] = useState();
  const color = 'rgb(82,129,224)'
  const activeColor = 'rgb(153,51,51)'
  const [points, setPoints] = useState([]);

  const [start, setStart] = useState(new Date('2015-01-01 00:00:00'));
  const [end, setEnd] = useState(new Date('2017-01-01 00:00:00'));

  const genPoints = () => {
    if (active.length !== 2) {
      setLine()
      setDistance()
    }
    if (status === true) {
      let list = []
      data.forEach((point) => {
        const created = new Date(point.date_created)
        if (created >= start && created <= end) {
          const markColor = active.includes(point.id) ? activeColor : color
          const mark = (<Marker
            width={50}
            anchor={[point.lat, point.lng]}
            color={markColor}
            onClick={() => selectPoint(point.id)}
          >
          </Marker>)
          list.push(mark)
        }

      })
      setPoints(list)
      setStatus(false)
    }
  }

  const selectPoint = (id) => {
    if (active.includes(id)) {
      const newActive = active.filter(e => e !== id)
      setActive(newActive)
    } else {
      setActive([...active, id])
    }
  }

  const getData = () => {
    fetch('data.json'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setData(myJson)
      });
  }

  const calcHandler = () => {
    let a, b
    a = data.filter(item => item['id'] === active[0])[0]
    b = data.filter(item => item['id'] === active[1])[0]

    const posA = { lat: a.lat, lng: a.lng }
    const posB = { lat: b.lat, lng: b.lng }

    const lineGeomFeature = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[a.lng, a.lat], [b.lng, b.lat]] },
      properties: { "title": (haversine(posA, posB) / 1000).toFixed(2) + " Km" },
    }
    const lineGeom = () => {
      return (
        <GeoJson
          svgAttributes={{
            strokeWidth: "4",
            stroke: activeColor
          }}
        >
          <GeoJsonFeature feature={{ ...lineGeomFeature }} />
        </GeoJson>
      )
    }
    setDistance((haversine(posA, posB) / 1000).toFixed(2) + " Km")
    setLine(lineGeom)

  }

  useEffect(() => {
    data.length === 0 ? getData() : genPoints()
  });


  useEffect(() => {
    setActive([])
    setStatus(true)
  }, [start, end]);

  useEffect(() => {
    setStatus(true)
  }, [active]);

  return (
    <div className={classes.Map}>
      <div className={classes.Picker}>
        <div className={classes.Pick}>
          <DatePick
            onChange={setStart}
            value={start}
            name="Start time"
          />
        </div>
        <div className={classes.Pick}>
          <DatePick
            onChange={setEnd}
            value={end}
            name="End time"
          />
        </div>
        <div className={classes.Pick}>
          {active.length === 2 ? <Button onClick={calcHandler} text="Distance"></Button> : null}
        </div>
        <div className={classes.Pick}>
          <span className={classes.Dist}>{distance}</span>
        </div>
      </div>
      <div className={classes.Map}>
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center)
            setZoom(zoom)
          }}
        >
          {[points]}
          {line}
        </Map>
      </div>
    </div>

  )
}

export default MyMap