// System
import React, { useState, useEffect } from 'react';
// User
import 'ui-neumorphism/dist/index.css'
//import { overrideThemeVariables } from 'ui-neumorphism'
import { Alert, Card, CardContent, TextField, Button, H4, H6 } from 'ui-neumorphism'

// Main Component
const MainView = () => {

    // useState
    const [appMessage, setAppMessage] = useState("Welcome");
    const [appMessageType, setAppMessageType] = useState("info");
    const [browserURL, setBrowserURL] = useState("");
    const [isBrowserURLValid, setIsBrowserURLValid] = useState(false);


    // useEffect
    useEffect(() => {
    }, []);


    // onClicks
    const onOpenBrowserButton = () => {
        console.log("OpenBrowserButton");
        if (isBrowserURLValid) {
            window.api.send(
                // Channel
                "OpenBrowser",
                // Data
                {
                    url: browserURL
                }
            );
        } else {
            console.log("URL is invalid")
        }
    };
    const onStartButton = () => {
        console.log("StartButton");
        window.api.send(
            // Channel
            "Start",
            // Data
            {}
        );
    };


    // onChanges
    const onBrowserURLChange = (event) => {
        setBrowserURL(event.value);
    };


    // Validation Rules
    const checkIfValueIsURL = (value) => {
        // Check if the given url is valid
        let url = "";
        try {
            url = new URL(value);
        } catch (_) {
            setIsBrowserURLValid(false);
            return "URLが不正です";
        }
        setIsBrowserURLValid(true);
        return true;
    };


    // IPC Message Rx (from Main)
    window.api.on("AppMessage", (event, arg) => {
        setAppMessage(arg.message);
        setAppMessageType(arg.type);
    });


    // JSX
    return (
        <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
          {/* Title */}
          <H4>コンソール</H4>
          {/* Content URL */}
          <Card style={{ margin: '4px' }}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <H6>Webコンテンツ</H6>
                <TextField label="対象のURL"
                           value={browserURL}
                           onChange={onBrowserURLChange}
                           rules={[ checkIfValueIsURL ]}
                           hideExtra={false} width={450} />
              </div>
            </CardContent>
          </Card>
          {/* Buttons */}
          <div style={{ padding: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={onOpenBrowserButton}
                    style={{ margin: '4px' }}>ブラウザを開く</Button>
            <Button onClick={onStartButton}
                    style={{ margin: '4px' }}>計測開始</Button>
          </div>
          {/* Application Message */}
          <Alert inset type={appMessageType}
                 border='top' style={{ margin: '4px' }}>
            {appMessage}
          </Alert>
        </div>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
