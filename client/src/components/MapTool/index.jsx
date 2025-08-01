import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { map } from 'lodash';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import Freedraw, { CREATE, NONE } from 'react-leaflet-freedraw';
import PropTypes from 'prop-types';

export const polygonFromLatLngs = (latLngs, zoomLevel) => ({
    type: 'polygon',
    geometry: map(latLngs, (shape) =>
        map(shape, (point) => [point.lat, point.lng])
    ),
    zoom: zoomLevel,
});

function currentMode(mode) {
    if (mode === 'CREATE') {
        return CREATE;
    }
    return NONE;
}

function MapTool({ tileURL,
    tileAttribution,
    mode,
    onFeatureDrawn,
    objects,
    zoom,
    minZoom,
    maxZoom,
    center,
    updateView }) {

    const freedrawRef = useRef(null);

    const handleMarkersDraw = useCallback((event) => {
        if (event.eventType !== 'clear') {
            if (event.latLngs !== undefined || event.latLngs.length !== 0) {
                onFeatureDrawn(polygonFromLatLngs(event.latLngs, zoom));
                freedrawRef.current.clear();
            }
        }
    }, [zoom]);

    const ViewTracker = () => {
        const map = useMapEvents({
            moveend() {
                //const map = mapRef.current;
                if (map != null) {
                    //console.log('MOVEEND detected');
                    const currCenter = map.getCenter();
                    const currZoom = map.getZoom();
                    //console.log(currCenter);
                    updateView(currCenter, currZoom);
                }
            },
            zoomend() {
                if (map != null) {
                    //console.log('ZOOMEND detected');
                    const currCenter = map.getCenter();
                    const currZoom = map.getZoom();
                    //console.log(currZoom);
                    updateView(currCenter, currZoom);
                }
            },
        });

        return null;
    };

    const handlers = useMemo(
        () => ({
            markers: handleMarkersDraw,
        }),
        [handleMarkersDraw]
    );

    const SetView = (() => {
        const map = useMap()
        useEffect(() => {
            map.setView(center, zoom)
        }, [center, zoom])
        return null
    })

    return (
        <MapContainer
            dragging={false}
            center={center}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            scrollWheelZoom={false}
            zoomControl={minZoom || maxZoom}
            doubleClickZoom={false}
            touchZoom={false}
            tap={false}
            style={{
                height: '100%',
                touchAction: 'none',
            }}
        >
            <TileLayer attribution={tileAttribution} url={tileURL} />
            <Freedraw
                mode={currentMode(mode)}
                eventHandlers={handlers}
                ref={freedrawRef}
            />
            {map(objects, (object, idx) => (
                <Polygon
                    key={idx}
                    color="#b1ef8d"
                    positions={object.geometry.coordinates}
                />
            ))}
            <SetView />
            <ViewTracker />
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
    mode: PropTypes.string.isRequired,
};

MapTool.defaultProps = {
    tileURL:
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png',
    tileAttribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    center: [38.678052, -96.27338],
    zoom: 4,
    bounds: null
};

export default MapTool;