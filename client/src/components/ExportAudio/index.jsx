import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { checkAudio, downloadAudio } from '../../services/api';

const ExportAudio = function ExportAudio({ surveyname }) {
    const [checked, setChecked] = useState(false);
    const [available, setAvailable] = useState(false);


    useEffect(() => {
        if (!checked) {
            checkAudio(surveyname).then(
            (check) => {
                console.log("exportaudio check: ", check);
                if (check == 200) {
                    setAvailable(true);
                }
                setChecked(true);
            },
            (error) => {
                console.log("exportaudio check error: ", error);
            });
        }
    }, [checked]);

    const download = () => {
        downloadAudio(surveyname).then(
        (response) => {
            console.log(response);
            const link = document.createElement("a");
            link.download = surveyname + ".tar.gz";
            link.href = window.URL.createObjectURL(response);
            link.dataset.downloadurl = ["application/gzip", link.download, link.href].join(":");

            const evt = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            link.dispatchEvent(evt);
            link.remove();
        },
        (error) => {
            console.log("ERROR: ", error);
            alert("Download error! Check server details");
        });
    }

    return (
        <div class="exportaudio">
            { available ? (
                <Button variant="primary" onClick={download}>
                    Export Audio Data
                </Button>
            ) : (
                <Button variant="secondary" disabled>
                    No Audio Data
                </Button>
            )}
        </div>
        )
};

export default ExportAudio;