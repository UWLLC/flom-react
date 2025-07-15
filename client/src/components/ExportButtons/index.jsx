import { Component, Suspense } from 'react';
import { Button, Table, Form, Container, Row, Col } from 'react-bootstrap';

const ExportButtons = function ExportButtons({ surveyname, responses, currData, headers, pre_geoJSON, fd_geoJSON }) {

    const exportData = (filename, outputType, data) => {
                const blob = new Blob([data], { type: outputType });
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
    };

    const formatExport = (filename, outputType) => {
                let result;
                if (outputType === "text/tab-separated-values") {
                        // 5/3/24 AMM: This code is from StackOverflow:
                        // https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable
                        result = [
                                headers.join('\t'), // header row first
                                currData.map(row => row.join('\t'))
                        ].join('\r\n');
                } else if (outputType === "text") {
                        result = JSON.stringify(responses).replaceAll("\",", "\n").replaceAll("},", "\n").replaceAll("{", "");
                } else if (outputType === "text/json") {
                        result = JSON.stringify(responses);
                } else {
                        console.log("Unsupported output type! Choices are:");
                        console.log("text/tab-separated-values");
                        console.log("text/json");
                        console.log("text");
                        return null;
                }
                exportData(filename, outputType, result);
    };

    const arcgisExport = (survey) => {
        const end = "_responses.json";
        exportData(survey + "_predefined" + end, "text/json", JSON.stringify(pre_geoJSON));
        exportData(survey + "_freedraw" + end, "text/json", JSON.stringify(fd_geoJSON));
    };

    return (
        <div class="export">
            <Button variant="primary" onClick={() => formatExport(surveyname + "Export.json", "text/json")}>
                Export JSON file
            </Button>
            <Button variant="primary" onClick={() => formatExport(surveyname + "Export.txt", "text")}>
                Export text file
            </Button>
            <Button variant="primary" onClick={() => formatExport(surveyname + "Export.tsv", "text/tab-separated-values")}>
                Export TSV file
            </Button>
            <Button variant="primary" onClick={() => arcgisExport(surveyname)}>
                Export JSON files for ArcGIS
            </Button>
        </div>
        )
};

export default ExportButtons;