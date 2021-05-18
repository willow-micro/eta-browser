// System
import React, { useState, useEffect } from 'react';
// User
import 'ui-neumorphism/dist/index.css'
//import { overrideThemeVariables } from 'ui-neumorphism'
import { Alert, Card, CardContent, TextField, Button, H4, H5, H6, Subtitle1, Subtitle2, Body1, Body2 } from 'ui-neumorphism'


// Main Component
const MainView = () => {

    // useState
    const [appMessage, setAppMessage] = useState("Welcome");
    const [appMessageType, setAppMessageType] = useState("info");
    const [browserURL, setBrowserURL] = useState("http://abehiroshi.la.coocan.jp");
    const [isBrowserURLValid, setIsBrowserURLValid] = useState(true);

    const [domType, setDomType] = useState("");
    const [domId, setDomId] = useState("");
    //const [domContent, setDomContent] = useState("");
    //const [domCoordinateX, setDomCoordinateX] = useState(0);
    //const [domCoordinateY, setDomCoordinateY] = useState(0);


    // useEffect
    useEffect(() => {
    }, []);


    // onClicks
    const onOpenBrowserButton = () => {
        console.log("OpenBrowserButton");
        if (isBrowserURLValid && browserURL.length > 0) {
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

    window.api.on("SendDOMDataFromMainToMainWindow", (event, arg) => {
        //console.log(arg.coordinates.x + ", " + arg.coordinates.y);
        console.log(arg.type);
        console.log(arg.id);
        //console.log(arg.content);
        setDomId(arg.id);
        setDomType(arg.type);
        //setDomContent(arg.content);
        //setDomCoordinateX(arg.coordinates.x);
        //setDomCoordinateY(arg.coordinates.y);
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
                    style={{ margin: '4px' }}
                    depressed>ブラウザを開く</Button>
            <Button onClick={onStartButton}
                    style={{ margin: '4px' }}
                    depressed
                    disabled>計測開始</Button>
          </div>
          {/* Application Message */}
          <Card style={{ margin: '4px' }}>
            <CardContent>
              <Alert inset type={appMessageType}
                     border='top' style={{ margin: '4px' }}>
                {appMessage}
              </Alert>
            </CardContent>
          </Card>
          {/* DOM Info */}
          <Card style={{ margin: '4px' }}>
            <CardContent>
              <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
                <Card inset style={{ margin: '4px' }}>
                  <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Subtitle2>Tag</Subtitle2>
                      <Body1>{domType}</Body1>
                    </div>
                  </CardContent>
                </Card>
                <Card inset style={{ margin: '4px' }}>
                  <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Subtitle2>id</Subtitle2>
                      <Body1>{domId}</Body1>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
