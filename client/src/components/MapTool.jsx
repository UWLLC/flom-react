import React, {
  useState, useRef, useEffect, useCallback, useMemo, forwardRef,
} from 'react';

import { map } from 'lodash';
import {
  MapContainer, TileLayer, Marker, Popup,
} from 'react-leaflet';
import Freedraw, { CREATE, NONE } from 'react-leaflet-freedraw';
import PropTypes from 'prop-types';

export const polygonFromLatLngs = (latLngs) => ({
  type: 'polygon',
  geometry: map(latLngs, (shape) => map(shape, (point) => [point.lat, point.lng])),
});

function currentMode(mode) {
  if (mode === 'CREATE') {
    return CREATE;
  }
  return NONE;
}

function MapTool({ tileURL, tileAttribution, mode, onFeatureDrawn }) {
  /*
  componentDidUpdate(prevProps) {
    const { mode, objects } = this.props;
    if (prevProps.objects !== objects) {
      this.setState({ objects });
    }
    if (prevProps.mode !== mode) {
      this.setState({ mode });
      this.changeMode(mode);
    }
  }

  handleFeatureDrawn(event) {
    if (event.eventType !== 'clear') {
      if (event.latLngs !== undefined || event.latLngs.length !== 0) {
        const { onFeatureDrawn } = this.props;
        onFeatureDrawn(polygonFromLatLngs(event.latLngs));
        freeDraw.clear();
      }
    }
  }
  */

  const freedrawRef = useRef(null);

  const handleMarkersDraw = useCallback(
    (event) => {
      if (event.eventType !== 'clear') {
        if (event.latLngs !== undefined || event.latLngs.length !== 0) {
          onFeatureDrawn(polygonFromLatLngs(event.latLngs));
          freedrawRef.current.clear();
        }
      }
    },
    [],
  );


  const handlers = useMemo(
    () => ({
      markers: handleMarkersDraw,
    }),
    [handleMarkersDraw],
  );

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
      style={{
        height: '100%',
        touchAction: 'none',
      }}
      doubleClickZoom={false}
      touchZoom={false}
    >
      <TileLayer
        attribution={tileAttribution}
        url={tileURL}
      />
      <Freedraw
        mode={currentMode(mode)}
        eventHandlers={handlers}
        ref={freedrawRef}
      />
    </MapContainer>
  );
}

MapTool.propTypes = {
  tileURL: PropTypes.string,
  tileAttribution: PropTypes.string,
  onFeatureDrawn: PropTypes.func.isRequired,
  center: PropTypes.array,
  bounds: PropTypes.array,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  zoom: PropTypes.number,
};

MapTool.defaultProps = {
  tileURL: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png',
  tileAttribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  center: [38.678052, -96.273380],
  zoom: 4,
  bounds: null,
};

export default MapTool;
