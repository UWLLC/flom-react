import { Component, Suspense } from 'react';
import { Button, Table, Form, Container, Row, Col } from 'react-bootstrap';
import Loading from '../../components/Loading';

class OutputFormatter extends Component {
    constructor(prop) {
        super(prop);

        this.state = {
            headers: [],
            rowsLatLon: [],
            rowsLonLat: [],
            currToggle: 'LatLon',
        };

        this.formatExport = this.formatExport.bind(this);
        this.dataExport = this.dataExport.bind(this);
        this.getHeaders = this.getHeaders.bind(this);
        this.formatTabular = this.formatTabular.bind(this);
        this.getRepeatData = this.getRepeatData.bind(this);
    }

    componentDidMount() {
        const [headers, freeDrawActIDs, additionalQIDs, addBasedOnIDs] = this.getHeaders();
        this.formatTabular(headers, freeDrawActIDs, additionalQIDs, addBasedOnIDs);
    }

    dataExport(filename, outputType) {
        const result = this.formatExport(outputType);
        const blob = new Blob([result], { type: outputType });
        const link = document.createElement("a");
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = [outputType, link.download, link.href].join(":");

        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        link.dispatchEvent(evt);
        link.remove();
    }

    formatExport(outputType) {
        let result;
        if (outputType === "text/tab-separated-values") {
            // 5/3/24 AMM: This code is from StackOverflow:
            // https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable
            if (this.state.currToggle === 'LatLon') {
                result = [
                    this.state.headers.join('\t'), // header row first
                    ...this.state.rowsLatLon.map(row => row.join('\t'))
                ].join('\r\n');
            } else {
                result = [
                    this.state.headers.join('\t'), // header row first
                    ...this.state.rowsLonLat.map(row => row.join('\t'))
                ].join('\r\n');
            }
        } else if (outputType === "text") {
            result = JSON.stringify(this.props.responses).replaceAll("\",", "\n").replaceAll("},", "\n").replaceAll("{", "");      
        } else if (outputType === "text/json") {
            result = JSON.stringify(this.props.responses);
        } else {
            console.log("Unsupported output type! Choices are:");
            console.log("text/tab-separated-values");
            console.log("text/json");
            console.log("text");
            return null;
        }
        return result;
    }

    getHeaders() {
        const headers = Object.keys(this.props.responses[0]); //content[0]);
        const detailIdx = headers.indexOf('detail');
        headers.splice(detailIdx, 1);

        const freeDrawActIDs = [];
        const additionalQIDs = {};
        const addBasedOnIDs = {}; // addQID: basedOnID
        for (const activity of this.props.survey["activities"]) { //this.survey["activities"]) {
            if (activity["type"] === 'map') {
                if (activity["function"] === 'predefined') {
                    for (const q of activity["questions"]) {
                        headers.push(q["id"] + "-geometry");
                        headers.push(q["id"] + "-zoom");
                        if (q.hasOwnProperty("questions")) {
                            for (const formQ of q["questions"]) {
                                headers.push(q["id"] + "-" + formQ["id"]);
                            }
                        }
                    }
                } else if (activity["function"] === 'additional') {
                    for (const q of activity["questions"]) {
                        if (q["type"] === "checkbox") {
                            for (const option of q["options"]) {
                                headers.push(option["id"]);
                                additionalQIDs[option["id"]] = activity["id"];
                                addBasedOnIDs[option["id"]] = activity["basedOn"];
                            }
                        } else {
                            headers.push(q["id"]);
                            additionalQIDs[q["id"]] = activity["id"];
                            addBasedOnIDs[q["id"]] = activity["basedOn"];
                        }
                    }
                } else if (activity["function"] === 'freedraw') {
                    freeDrawActIDs.push(activity["id"]);
                    headers.push(activity["id"] + "-name");
                    headers.push(activity["id"] + "-geometry");
                    headers.push(activity["id"] + "-zoom");
                } else {
                    console.log("unsupported map type");
                }
            } else if (activity["type"] === 'form') {
                for (const q of activity["questions"]) {
                    if (q["type"] === "checkbox") {
                        for (const option of q["options"]) {
                            headers.push(option["id"]);
                        }
                    } else {
                        headers.push(q["id"]);
                    }
                }
            } else {
                for (const q of activity["questions"]) {
                    headers.push(q["id"]);
                }
            }
        }
        return [headers, freeDrawActIDs, additionalQIDs, addBasedOnIDs];
    }

    getRepeatData(response) {
        const repeatLatLon = {};
        const repeatLonLat = {};
        for (const surveyinfo in response) {
            if (surveyinfo != 'detail') {
                repeatLatLon[surveyinfo] = response[surveyinfo];
                repeatLonLat[surveyinfo] = response[surveyinfo];
            }
        }
        for (const activity of this.props.survey["activities"]) {
            const actID = activity["id"];
            if (actID != this.state.freeDrawActIDs) {
                if (activity["type"] === 'map') {
                    if (activity["function"] === 'predefined') {
                        for (const q of activity["questions"]) {
                            const feature = response["detail"][actID][q["id"]];
                            if (feature["properties"]) {
                                repeatLatLon[q["id"] + "-zoom"] = feature["properties"]["zoom"];
                                repeatLonLat[q["id"] + "-zoom"] = feature["properties"]["zoom"];
                            }

                            const geometry = feature["geometry"];
                            let resultLatLon = geometry["type"].toUpperCase() + "(";
                            let resultLonLat = geometry["type"].toUpperCase() + "((";
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
                            repeatLatLon[q["id"] + "-geometry"] = resultLatLon + ")";
                            repeatLonLat[q["id"] + "-geometry"] = resultLonLat + "))";
                            if (q.hasOwnProperty("questions")) {
                                for (const formQ of q["questions"]) {
                                    const qHeader = q["id"] + "-" + formQ["id"];
                                    repeatLatLon[qHeader] = response["detail"][actID][q["id"]][formQ["id"]];
                                    repeatLonLat[qHeader] = response["detail"][actID][q["id"]][formQ["id"]];
                                }
                            }
                        }
                    }
                } else if (activity["type"] === 'form') {
                    for (const q of activity["questions"]) {
                        if (q["type"] === "checkbox") {
                            for (const option of q["options"]) {
                                repeatLatLon[option["id"]] = response["detail"][actID][option["id"]];
                                repeatLonLat[option["id"]] = response["detail"][actID][option["id"]];
                            }
                        } else {
                            repeatLatLon[q["id"]] = response["detail"][actID][q["id"]];
                            repeatLonLat[q["id"]] = response["detail"][actID][q["id"]];
                        }
                    }
                } else {
                    for (const q in activity["questions"]) {
                        repeatLatLon[q["id"]] = response["detail"][actID][q["id"]];
                        repeatLonLat[q["id"]] = response["detail"][actID][q["id"]];
                    }
                }
            }
        }
        return [ repeatLatLon, repeatLonLat ];
    }

    formatTabular(headers, freeDrawActIDs, additionalQIDs, addBasedOnIDs) {
        const latLon = [];
        const lonLat = [];

        // Make a row for each freedraw object in each response
        for (const response of this.props.responses) {
            // For each response, get data that is repeated on each row

            const [repeatLatLon, repeatLonLat] = this.getRepeatData(response);
            //console.log("Repeat info");
            //console.log(repeatData);

            // For each freedraw object submitted in the current response,
            // create the row with the repeated information, the freedraw
            // object, and any additional responses based on the freedraw
            // object.
            if (freeDrawActIDs.length === 0) {
                const currRowLatLon = [];
                const currRowLonLat = [];
                for (const header of headers) {
                    if (header in repeatLatLon) {
                        currRowLatLon.push(repeatLatLon[header]);
                        currRowLonLat.push(repeatLonLat[header]);
                    } else {
                        currRowLatLon.push("ERROR-unhandled");
                        currRowLonLat.push("ERROR-unhandled");
                    }
                }
                latLon.push(currRowLatLon);
                lonLat.push(currRowLonLat);
            } else {
                for (const fidx in freeDrawActIDs) {
                    const fdAct = response["detail"][freeDrawActIDs[fidx]];
                    for (const fdRID in fdAct) {
                        const fdResp = fdAct[fdRID];
                        const currRowLatLon = [];
                        const currRowLonLat = [];
                        for (const hidx in headers) {
                            const header = headers[hidx];
                            if (header in repeatLatLon) {
                                // everything except freedraw and additional
                                currRowLatLon.push(repeatLatLon[header]);
                                currRowLonLat.push(repeatLonLat[header]);
                            } else if (header.endsWith("-name")) {
                                // freedraw obj name
                                if (fdRID.startsWith(header.split('-name')[0])) {
                                    currRowLatLon.push(fdResp["name"]);
                                    currRowLonLat.push(fdResp["name"]);
                                } else {
                                    currRowLatLon.push(" ");
                                    currRowLonLat.push(" ");
                                }
                            } else if (header.endsWith("-zoom")) {
                                if (fdRID.startsWith(header.split('-zoom')[0])) {
                                    if (fdResp["properties"]) {
                                        currRowLatLon.push(fdResp["properties"]["zoom"]);
                                        currRowLonLat.push(fdResp["properties"]["zoom"]);
                                    } else {
                                        currRowLatLon.push(" ");
                                        currRowLonLat.push(" ");
                                    }
                                } else {
                                    currRowLatLon.push(" ");
                                    currRowLonLat.push(" ");
                                }
                            } else if (header.endsWith("-geometry")) {
                                // freedraw coords
                                if (fdRID.startsWith(header.split('-geometry')[0])) {
                                    const geometry = fdResp["geometry"];
                                    let resultLatLon = geometry["type"].toUpperCase() + "(";
                                    let resultLonLat = geometry["type"].toUpperCase() + "((";
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
                                    currRowLatLon.push(resultLatLon + ")");
                                    currRowLonLat.push(resultLonLat + "))");
                                } else {
                                    currRowLatLon.push(" ");
                                    currRowLonLat.push(" ");
                                }
                            } else if (header in additionalQIDs) {
                                // freedraw id info for each additional if has
                                // curr freeDraw activity
                                const addActID = additionalQIDs[header];
                                if (fdRID.startsWith(addBasedOnIDs[header])) {
                                    currRowLatLon.push(response["detail"][addActID][fdRID][header]);
                                    currRowLonLat.push(response["detail"][addActID][fdRID][header]);
                                } else {
                                    currRowLatLon.push(" ");
                                    currRowLonLat.push(" ");
                                }
                            } else {
                                currRowLatLon.push("unhandled survey data");
                                currRowLonLat.push("unhandled survey data");
                            }
                        }
                        latLon.push(currRowLatLon);
                        lonLat.push(currRowLonLat);
                    }
                }
            }
        }
        this.setState({
            headers: headers,
            rowsLatLon: latLon,
            rowsLonLat: lonLat,
        });
        return null;
    }

    render() {
        const { responses } = this.props;
        const { headers, rowsLatLon, rowsLonLat } = this.state;
        const radios = [
            {name: '((LAT, LON))', value: 'LatLon'},
            {name: '((LON LAT))', value: 'LonLat'}
        ];

        return (
            <Container fluid>
                <Suspense fallback={<Loading />}>
                    <Row>
                        <Col>
                            <div class="export">
                                <Button variant="primary" onClick={() => this.dataExport("Export.json", "text/json")}>
                                    Export JSON file
                                </Button>
                                <Button variant="primary" onClick={() => this.dataExport("Export.txt", "text")}>
                                    Export text file
                                </Button>
                                <Button variant="primary" onClick={() => this.dataExport("Export.tsv", "text/tab-separated-values")}>
                                    Export TSV file
                                </Button>
                            </div>
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
                                                checked={this.state.currToggle === radio.value}
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
                        { headers.length !== 0 && rowsLatLon.length!== 0 && (
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
                                        { this.state.currToggle === 'LatLon' ? (
                                            rowsLatLon.map((row) => (
                                                <tr key={rowsLatLon.indexOf(row)}>
                                                    {Array.from(row).map((cell) => (
                                                        <td key={`${rowsLatLon.indexOf(row)}-` + headers[Array.from(row).indexOf(cell)]}>
                                                            {cell}
                                                        </td>
                                                    ))
                                                    }
                                                </tr>
                                            ))
                                        ) : (
                                            rowsLonLat.map((row) => (
                                                <tr key={rowsLonLat.indexOf(row)}>
                                                    {Array.from(row).map((cell) => (
                                                        <td key={`${rowsLonLat.indexOf(row)}-` + headers[Array.from(row).indexOf(cell)]}>
                                                            {cell}
                                                        </td>
                                                    ))
                                                    }
                                                </tr>
                                            ))
                                        )}
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