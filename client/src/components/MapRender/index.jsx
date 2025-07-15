import { Component, lazy, Suspense, useMemo, useEffect } from 'react';
import { Button, Col, Container, Row, Alert } from 'react-bootstrap';

import TitleRender from '../TitleRender';
import Loading from '../Loading';

const MapTool = lazy(() => import('../MapTool'));
const MapQuestion = lazy(() => import('../MapQuestion'));

// Process Freedraw's latLngs to GeoJson Object
export const featureFromGeometry = (geometry) => {
    const GeoJsonTemplate = {
        geometry: {},
        properties: {},
    };
    if (geometry.type === 'polygon') {
        const json = GeoJsonTemplate.geometry;
        json.type = 'Polygon';
        json.coordinates = geometry.geometry;
        const geoProps = GeoJsonTemplate.properties;
        geoProps.zoom = geometry.zoom;
        return GeoJsonTemplate;
    }
    return {};
};

class MapRender extends Component {
    constructor(prop) {
        super(prop);

        this.state = {
            questionID: this.props.activity.id,
            gis: [],
            center: this.props.activity.center,
            zoom: this.props.activity.zoomLevel,
            mode: 'NONE',
            popped: false,
            featureDrawn: false,
        };

        this.fireDraw = this.fireDraw.bind(this);
        this.updateQuestionID = this.updateQuestionID.bind(this);
        this.changeGIS = this.changeGIS.bind(this);
        this.undoFireDraw = this.undoFireDraw.bind(this);
        this.popPolygon = this.popPolygon.bind(this);
        this.reset = this.reset.bind(this);
        this.renderOnChange = this.renderOnChange.bind(this);
        this.updateCurrMapView = this.updateCurrMapView.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activity !== this.props.activity) {
            this.setState({
                questionID: 0,
                mode: 'NONE',
                gis: [],
                center: this.props.activity.center,
                zoom: this.props.activity.zoomLevel,
                popped: false,
                featureDrawn: false,
            });
        }
    }

    updateQuestionID(id) {
        this.setState({
            questionID: id,
            popped: false,
            featureDrawn: false,
        });
    }

    changeGIS(gis) {
        const gisDisplay = [];
        gisDisplay[0] = gis;
        const coords = gis["geometry"]["coordinates"][0];
        const zoomLevel = gis["properties"]["zoom"];
        const lat_avg = coords.reduce(
            (curr_sum, curr) => curr_sum + curr[0], 0,
        ) / coords.length;
        const lon_avg = coords.reduce(
            (curr_sum, curr) => curr_sum + curr[1], 0,
        ) / coords.length;
        const gisCenter = [lat_avg, lon_avg];
        this.setState({
            gis: gisDisplay,
            center: gisCenter,
            zoom: zoomLevel
        });
    }

    onFeatureDrawn = (featureGeometry) => {
        const id = this.state.questionID;
        this.props.onChange(id, featureFromGeometry(featureGeometry));
        const newgis = this.state.gis.slice();
        newgis.push(featureFromGeometry(featureGeometry));

        this.setState({
            gis: newgis,
            mode: 'NONE',
            popped: false,
            featureDrawn: true,
        });
    };

    fireDraw() {
        const mapCenter = this.state.center;
        this.setState({
            center: mapCenter,
            mode: 'CREATE',
            popped: false,
            featureDrawn: false,
        });
    }

    undoFireDraw() {
        this.setState({
            mode: 'NONE'
        });
    }

    popPolygon = () => {
        const id = this.state.questionID;
        const {gis} = this.state;

        const newgis = gis.slice(0, gis.length - 1)
        delete this.props.values[this.props.activity.id][id];
        this.setState({
            gis: newgis,
            popped: true,
            mode: 'CREATE',
            questionID: id,
            featureDrawn: false,
        });
        //console.log("POPPED GIS");
        //console.log(newgis);
        //console.log("POPPED VALUES");
        //console.log(this.props.values);
        //console.log("CURRENT ID");
        //console.log(id);
    }

    reset = () => {
        //console.log("RESETTING");
        const curr_id = this.state.questionID;
        const curr_mode = this.state.mode;
        this.setState({
            mode: curr_mode,
            questionID: curr_id,
            popped: false,
            featureDrawn: false,
        });
    }

    renderOnChange = (questionID, response) => {
        this.props.onChange(questionID, response);
        this.reset();
    }

    updateCurrMapView = (currCenter, currZoom) => {
        this.setState({
            center: currCenter,
            zoom: currZoom
        });
        //console.log('CURRCENTER UPDATED');
        //console.log(this.state.center);
    }

    render() {
        const { activity, values, onChange, current, length } = this.props;

        const { gis, center, zoom, mode, popped, featureDrawn, questionId } = this.state;
        const activeBtn = {
            backgroundColor: "#2E8B57",
            borderColor: "#2E8B57",
            color: "#FFFFFF",
            margin: "1em"
        };

        const inactiveBtn = {
            backgroundColor: "#d3d3d3",
            borderColor: "#d3d3d3",
            color: "#000000",
            margin: "1em"
        };

        return (
            <div className="mapContainer" id="mapContainer">
                <div className="side" id="side">
                    <div
                        style={{
                            padding: '0 20px',
                            overflow: 'auto',
                        }}
                    >
                        <TitleRender
                            id={activity.id}
                            title={activity.title}
                            intro={activity.helpText}
                            current={current}
                            length={length}
                        />
                        <Suspense fallback={<Loading />}>
                            { activity.function !== 'additional' && (
                                <Container id="mapBtnContainer">
                                    <Row>
                                        <Col>
                                            <Button type="primary"
                                                onClick={featureDrawn && !popped ? this.popPolygon : () => {alert("There is no area available to redraw.")}}
                                                style={featureDrawn && !popped ? activeBtn : inactiveBtn }
                                                aria-disabled={!featureDrawn || popped}>
                                                Redraw Area
                                            </Button>
                                        </Col>
                                        <Col>
                                            <Button type="primary"
                                                onClick={mode === 'CREATE' ? this.undoFireDraw : () => {alert("You can't use the 'reposition' button if the 'draw' button is inactive.")}}
                                                style={mode === 'CREATE'? activeBtn : inactiveBtn }
                                                aria-disabled={mode !== 'CREATE'}>
                                                Reposition Map
                                            </Button>
                                        </Col>
                                    </Row>
                                </Container>
                            )}
                            <MapQuestion
                                key={activity.id}
                                activity={activity}
                                fireDraw={this.fireDraw}
                                reset={this.reset}
                                values={values}
                                mode={mode}
                                onChange={onChange}
                                updateQuestionID={this.updateQuestionID}
                                changeGIS={this.changeGIS}
                                onFinish={this.props.onFinish}
                            />
                        </Suspense>
                    </div>
                </div>
                <div className="map">
                    <Suspense fallback={<Loading />}>
                        <MapTool
                            key={activity.id}
                            tileURL={activity.tileURL}
                            tileAttribution={activity.tileAttribution}
                            center={center}
                            updateView={this.updateCurrMapView}
                            bounds={activity.bounds}
                            zoom={zoom}
                            minZoom={activity.minZoom}
                            maxZoom={activity.maxZoom}
                            onFeatureDrawn={this.onFeatureDrawn}
                            objects={Object.values(gis)}
                            mode={mode}
                        />
                    </Suspense>
                </div>
            </div>
        );
    }
}

export default MapRender;