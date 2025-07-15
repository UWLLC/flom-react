import { Component, Suspense } from 'react';
import { Button, Table, Form, Container, Row, Col } from 'react-bootstrap';
import Loading from '../../components/Loading';
import ExportButtons from '../ExportButtons';

class OutputFormatter extends Component {
    constructor(prop) {
        super(prop);

        this.state = {
            currToggle: 'LonLat',
            headers: [],
            rowsLatLon: [],
            rowsLonLat: [],
            freeDrawActIDs: [],
            predefinedIDs: [],
            additionalQIDs: {},
            addBasedOnIDs: {},
            pre_geoJSON: {},
            fd_geoJSON: {},
            h_loaded: false,
            tab_loaded: false,
            gis_loaded: false,
        };

        this.formatQuestionsHeaders = this.formatQuestionsHeaders.bind(this);
        this.getHeaders = this.getHeaders.bind(this);
        this.getRepeatData = this.getRepeatData.bind(this);
        this.getGeometry = this.getGeometry.bind(this);
        this.getZoom = this.getZoom.bind(this);
        this.pushTwice = this.pushTwice.bind(this);
        this.formatTabular = this.formatTabular.bind(this);
        this.formatGeoJSON = this.formatGeoJSON.bind(this);
    }


    componentDidMount() {
        if (this.props.responses) {
            this.getHeaders();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.responses !== prevProps.responses) {
            this.setState({
                ...this.state,
                h_loaded: false,
                tab_loaded: false,
                gis_loaded: false
            })
            this.getHeaders();
        }
    }

    formatQuestionsHeaders(questions, prefix) {
        const formatted = [];
        for (const q of questions) {
            if (q["type"] === "checkbox") {
                for (const opt of q["options"]) {
                    formatted.push(prefix + opt["id"]);
                }
            } else {
                formatted.push(prefix + q["id"]);
            }
        }
        return formatted;
    }

    getHeaders() {
        const headers = Object.keys(this.props.responses[0]); //content[0]);
        const detailIdx = headers.indexOf('detail');
        headers.splice(detailIdx, 1);

        const freeDrawActIDs = [];
        const predefinedIDs = [];
        const additionalQIDs = {};
        const addBasedOnIDs = {}; // addQID: basedOnID
        for (const activity of this.props.survey["activities"]) { //this.survey["activities"]) {
            if (activity["type"] === 'map') {
                if (activity["function"] === 'predefined') {
                    predefinedIDs.push(activity["id"]);
                    for (const q of activity["questions"]) {
                        headers.push(q["id"] + "-geometry");
                        headers.push(q["id"] + "-zoom");
                        if (q.hasOwnProperty("questions")) {
                            const h = this.formatQuestionsHeaders(q["questions"], q["id"] + "-");
                            h.forEach((h_item) => headers.push(h_item));
                        }
                    }
                } else if (activity["function"] === 'additional') {
                    const h = this.formatQuestionsHeaders(activity["questions"], "add-");
                    h.forEach((h_item) => headers.push(h_item));
                    h.forEach((addH) => {
                        additionalQIDs[addH] = activity["id"];
                        addBasedOnIDs[addH] = activity["basedOn"];
                    });
                } else if (activity["function"] === 'freedraw') {
                    freeDrawActIDs.push(activity["id"]);
                    headers.push(activity["id"] + "-name");
                    headers.push(activity["id"] + "-geometry");
                    headers.push(activity["id"] + "-zoom");
                } else {
                    console.log("unsupported map type");
                }
            } else if (activity["type"] === 'randomAudio') { // START HERE
                for (const audio of activity["audioFiles"]) {
                    const filename = audio.slice(audio.lastIndexOf("/") + 1);
                    const h = this.formatQuestionsHeaders(activity["questions"], filename + "-");
                    h.forEach((h_item) => headers.push(h_item));
                    headers.push(filename + "-random_order_num");
                }
            } else {
                const h = this.formatQuestionsHeaders(activity["questions"], "");
                h.forEach((h_item) => headers.push(h_item));
            }
        }
        this.setState({
            ...this.state,
            headers: headers,
            freeDrawActIDs: freeDrawActIDs,
            predefinedIDs: predefinedIDs,
                    additionalQIDs: additionalQIDs,
                    addBasedOnIDs: addBasedOnIDs,
            h_loaded: true
        });
    }


    getRepeatData(response) {
        const repeat = {};
        for (const surveyinfo in response) {
            if (surveyinfo != 'detail') {
                repeat[surveyinfo] = response[surveyinfo];
            }
        }

        for (const activity of this.props.survey["activities"]) {
            //const actID = activity["id"];
            const r_d_actID = response["detail"][activity["id"]];
            if (activity["type"] === 'form') {
                for (const q of activity["questions"]) {
                    if (q["type"] === "checkbox") {
                        for (const option of q["options"]) {
                            if (option["id"] in r_d_actID) {
                                repeat[option["id"]] = r_d_actID[option["id"]];
                            } else {
                                repeat[option["id"]] = "false";
                            }
                        }
                    } else {
                        repeat[q["id"]] = r_d_actID[q["id"]];
                    }
                }
            } else if (activity["type"] === 'randomAudio') {
                for (const audio of activity["audioFiles"]) {
                    const filename = audio.slice(audio.lastIndexOf("/") + 1);
                    for (const q of activity["questions"]) {
                        if (q["type"] === "checkbox") {
                            for (const option of q["options"]) {
                                const optHeader = filename + "-" + option["id"];
                                if (option["id"] in r_d_actID[audio]) {
                                    repeat[optHeader] = r_d_actID[audio][option["id"]];
                                } else {
                                    repeat[optHeader] = "false";
                                }
                            }
                        } else {
                            const qHeader = filename + "-" + q["id"];
                            repeat[qHeader] = r_d_actID[audio][q["id"]];
                        }
                    }
                    const orderHeader = filename + "-random_order_num";
                    repeat[orderHeader] = r_d_actID[audio]["random_order_num"];
                }
            }
        }
        return repeat;
    }

    getGeometry(arr1, arr2, id, resp, hdr) {
        if (id.startsWith(hdr.split('-geometry')[0])) {
            const geometry = resp["geometry"];
            let resultLatLon = geometry["type"].toUpperCase() + "(";
            let resultLonLat = geometry["type"].toUpperCase() + "(";
            if (geometry["coordinates"].length !== 0) {
                for (const coord of geometry["coordinates"][0]) {
                    if (resultLatLon !== geometry["type"].toUpperCase() + "(") {
                        resultLatLon += ", ";
                        resultLonLat += ", ";
                    }
                    resultLatLon += "(" + coord[0] + ", " + coord[1] + ")";
                    resultLonLat += coord[1] + " " + coord[0];
                }
            }
            arr1.push(resultLatLon + ")");
            arr2.push(resultLonLat + ")");
        } else {
            this.pushTwice(arr1, arr2, "");
        }
    }

    getZoom(arr1, arr2, id, resp, hdr) {
        if (id.startsWith(hdr.split('-zoom')[0])) {
            if (resp["properties"]) {
                this.pushTwice(arr1, arr2, resp["properties"]["zoom"]);
            } else {
                this.pushTwice(arr1, arr2, "");
            }
        } else {
            this.pushTwice(arr1, arr2, "");
        }
    }

    pushTwice(arr1, arr2, data) {
        arr1.push(data);
        arr2.push(data);
    }

    formatTabular() {
        const latLon = [];
        const lonLat = [];

        // Make a row for each freedraw object in each response
        for (const response of this.props.responses) {
            // For each response, get data that is repeated on each row

            const curr_repeat = this.getRepeatData(response);
            //console.log("Repeat info");
            //console.log(repeatData);

            // For each freedraw object submitted in the current response, create
            // the row with the repeated information, the freedraw object,
            // and any additional responses based on the freedraw object.
            if (this.state.freeDrawActIDs.length === 0 && this.state.predefinedIDs.length === 0) {
                const currRowLatLon = [];
                const currRowLonLat = [];
                for (const header of this.state.headers) {
                    if (header in curr_repeat) {
                        this.pushTwice(currRowLatLon, currRowLonLat, curr_repeat[header]);
                    } else {
                        this.pushTwice(currRowLatLon, currRowLonLat, "ERROR-unhandled");
                    }
                }
                latLon.push(currRowLatLon);
                lonLat.push(currRowLonLat);
            } else {
                for (const preidx in this.state.predefinedIDs) {
                    const preAct = response["detail"][this.state.predefinedIDs[preidx]];
                    for (const preRID in preAct) {
                        const preResp = preAct[preRID];
                        const currRowLatLon = [];
                        const currRowLonLat = [];
                        for (const header of this.state.headers) {
                            if (header in curr_repeat) {
                                this.pushTwice(currRowLatLon, currRowLonLat, curr_repeat[header]);
                            } else if (header.endsWith("-zoom")) {
                                this.getZoom(currRowLatLon, currRowLonLat, preRID, preResp, header)
                            } else if (header.endsWith("-geometry")) {
                                this.getGeometry(currRowLatLon, currRowLonLat, preRID, preResp, header)
                            } else if (header.startsWith(preRID)) {
                                const qID = header.split(preRID + "-")[1];
                                this.pushTwice(currRowLatLon, currRowLonLat, preResp[qID]);
                            } else {
                                this.pushTwice(currRowLatLon, currRowLonLat, "");
                            }
                        }
                        latLon.push(currRowLatLon);
                        lonLat.push(currRowLonLat);
                    }
                }
                for (const fidx in this.state.freeDrawActIDs) {
                    const fdAct = response["detail"][this.state.freeDrawActIDs[fidx]];
                    for (const fdRID in fdAct) {
                        const fdResp = fdAct[fdRID];
                        const currRowLatLon = [];
                        const currRowLonLat = [];
                        for (const header of this.state.headers) {
                            if (header in curr_repeat) {
                                this.pushTwice(currRowLatLon, currRowLonLat, curr_repeat[header]);
                            } else if (header.endsWith("-name")) {
                                // freedraw obj name
                                if (fdRID.startsWith(header.split('-name')[0])) {
                                    this.pushTwice(currRowLatLon, currRowLonLat, fdResp["name"]);
                                } else {
                                    this.pushTwice(currRowLatLon, currRowLonLat, "");
                                }
                            } else if (header.endsWith("-zoom")) {
                                this.getZoom(currRowLatLon, currRowLonLat, fdRID, fdResp, header)
                            } else if (header.endsWith("-geometry")) {
                                this.getGeometry(currRowLatLon, currRowLonLat, fdRID, fdResp, header)
                            } else if (header in this.state.additionalQIDs) {
                                // freedraw id info for each additional if has
                                // curr freeDraw activity
                                const addActID = this.state.additionalQIDs[header];
                                if (fdRID.startsWith(this.state.addBasedOnIDs[header])) {
                                    this.pushTwice(currRowLatLon, currRowLonLat, response["detail"][addActID][fdRID][header.split("add-")[1]]);
                                } else {
                                    this.pushTwice(currRowLatLon, currRowLonLat, "");
                                }
                            } else {
                                this.pushTwice(currRowLatLon, currRowLonLat, "");
                            }
                        }
                        latLon.push(currRowLatLon);
                        lonLat.push(currRowLonLat);
                    }
                }
            }
        }
        this.setState({
            ...this.state,
            rowsLatLon: latLon,
            rowsLonLat: lonLat,
            tab_loaded: true
        });
        return null;
    }


    formatGeoJSON() {
        const pre_geojson = {
            "type": "FeatureCollection",
            "features": []
        }

        const fd_geojson = {
            "type": "FeatureCollection",
            "features": []
        }

        const fd_headers = [];
        for (const header of this.state.headers) {
            let id;
            if (header.endsWith("-name")) {
                id = header.split("-name")[0];
            } else if (header.endsWith("-geometry")) {
                id = header.split("-geometry")[0];
            } else if (header.endsWith("-zoom")) {
                id = header.split("-zoom")[0];
            }
            if (this.state.freeDrawActIDs.includes(id)) {
                fd_headers.push(header);
            }
        }

        let format;
        if (this.state.currToggle === 'LatLon') {
            format = this.state.rowsLatLon;
                } else {
                        format = this.state.rowsLonLat;
                }
        for (const row of format) {
            let type = "pre";
            const feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": []
                },
                "properties": {}
            }
            for (const col_index in row) {
                const curr_header = this.state.headers[col_index];
                const cell_info = row[col_index];
                if (cell_info) {
                    const cell = cell_info.toString();
                    if (cell.startsWith("POLYGON")) {
                        const coordinates = [];
                        const geom = cell.slice(8, -1);
                        let split;
                        if (this.state.currToggle === "LatLon") {
                            split = geom.slice(1, -1).split("), (");
                        } else {
                            split = geom.split(", ");
                        }
                        for (const coords of split) {
                            const curr_coord = [];
                            const split_coord = coords.split(" ");
                            curr_coord.push(parseFloat(split_coord[0]));
                            curr_coord.push(parseFloat(split_coord[1]));
                            coordinates.push(curr_coord);
                        }
                        feature["geometry"]["coordinates"].push(coordinates);
                        if (fd_headers.includes(curr_header)) {
                            type = "fd";
                        }
                    } else {
                        feature["properties"][curr_header] = cell;
                    }
                }
            }
            if (type === "pre") {
                pre_geojson["features"].push(feature);
            } else {
                fd_geojson["features"].push(feature);
            }
        }
        this.setState({
            ...this.state,
            pre_geoJSON: pre_geojson,
            fd_geoJSON: fd_geojson,
            gis_loaded: true
        });
        return null;
    }

    render() {
        const { responses } = this.props;
        const { headers, rowsLatLon, rowsLonLat, h_loaded, tab_loaded, gis_loaded, currToggle } = this.state;
        const radios = [
            {name: '(LAT, LON)', value: 'LatLon'},
            {name: 'LON LAT', value: 'LonLat'}
        ];
        var surveyname;
        if (h_loaded && !tab_loaded) {
            this.formatTabular();
        }
        if (tab_loaded && !gis_loaded) {
            this.formatGeoJSON();
        }
        if (responses.length > 0) {
            surveyname = responses[0]["survey"];
        }
        var currData;
        if (currToggle === 'LatLon') {
            currData = rowsLatLon;
        } else {
            currData = rowsLonLat;
        }

        return (
            <Container fluid>
                <Row>
                    <Col>
                        <ExportButtons
                            surveyname={surveyname}
                            responses={responses}
                            currData={currData}
                            headers={headers}
                            pre_geoJSON={this.state.pre_geoJSON}
                            fd_geoJSON={this.state.fd_geoJSON}
                        />
                    </Col>
                    <Col>
                        <Form>
                            <Form.Group key="radio-format">
                                <Form.Label>Select Polygon Format</Form.Label>
                                <div key="format-div" className="mb-3">
                                    {radios.map((radio, idx) => (
                                        <Form.Check
                                            inline
                                            type="radio"
                                            key={idx}
                                            id={`radio-${idx}`}
                                            value={radio.value}
                                            label={radio.name}
                                            checked={currToggle === radio.value}
                                            onChange={(event) =>
                                                this.setState({currToggle: event.target.value})
                                            }
                                        />
                                    ))}
                                </div>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <p>ArcGIS usually requires a longitude-latitude (LON LAT) Polygon format. Please double check what format you need before downloading the data.</p>
                    <p>Polygon coordinates are truncated in the table view and exported in their entirety in all formats.</p>
                </Row>
                <Suspense fallback={<Loading />}>
                    <Row>
                        { tab_loaded && (
                            <div class="table-responsive-outer">
                                <Table key="ResponsesTable" class="table-striped" responsive striped>
                                    <thead>
                                        <tr>
                                            {
                                                headers.map((header) => (
                                                    <th key={'col-' + header}>{header}</th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { currData.map((row) => (
                                                <tr key={currData.indexOf(row)}>
                                                    {Array.from(row).map((cell) => (
                                                        <td key={`${currData.indexOf(row)}-` + headers[Array.from(row).indexOf(cell)]}>
                                                            { cell && cell.length > 50 ? (
                                                                cell.substring(0, 50) + "..."
                                                            ) : (cell)}
                                                        </td>
                                                    ))
                                                    }
                                                </tr>))
                                        }
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Row>
                </Suspense>
            </Container>
        );
    }
}

export default OutputFormatter;