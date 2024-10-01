import { ReactReader } from "react-reader";
import { EpubActions } from "./components/EpubActions";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import TextToSpeech from "./components/TextToSpeech";

function App() {
  const [data, setData] = useState({
    // filteredData: {
    //   id: "dda8aa90-2ef0-11ef-9878-a348fc3808ec",
    //   batch_id: "1cfe1d70-2192-11ef-bade-719dde750085",
    //   url: "https://qbslms.s3.ap-south-1.amazonaws.com/course/epub/1718879752-9340816004689_measuring_time_over_time.epub?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAZ7FXKZULGQ3O5YXQ%2F20240628%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240628T132107Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Signature=b63758aa7bf56250934f23ce7b5569613a65305f1472d40f757fb26a519858f5",
    //   header: {
    //     map: {
    //       "x-authorization":
    //         "J3ns3kq5HhDrea8vwlrCkZCAIYA9kaupkhXun1RRhBr3NgS6GKgC7ULePuhpD9YV",
    //       platform: "mobile",
    //       accept: "application/json",
    //       "content-type": "application/json",
    //       authorization:
    //         "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG1zLnFic2xlYXJuaW5nLmNvbS9hcGkvbG9naW4iLCJpYXQiOjE3MTk1NTUwMjUsImV4cCI6MTc1MTA5MTAyNSwibmJmIjoxNzE5NTU1MDI1LCJqdGkiOiJUaWhrY096a1FhWkJsSmxIIiwic3ViIjoiYTg1NDcxMjAtMmVlZi0xMWVmLWE2YTItZjM0MDEzMjFkMjE4IiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.Uvcqb4D678DtQzpCOJtrFmP2kprpeUorS6wlW1ceWbU",
    //       "cache-control": "no-cache",
    //       pragma: "no-cache",
    //       expires: "0",
    //     },
    //   },
    //   isInternet: true,
    // },
  });
  useEffect(() => {
    document.addEventListener("message", (event) => {
      const d = JSON.parse(event.data);
      setData(d);
    });
  }, []);

  const epubPersistedLocation = localStorage.getItem(
    `${data?.filteredData?.id}-persist-location`
  );
  const [selections, setSelections] = useState([]);
  const rendition = useRef(undefined);
  const [location, setLocation] = useState(epubPersistedLocation ?? 0);
  const [scrollable, setScrollable] = useState(false);
  const [selection, setSelection] = useState(false);

  useEffect(() => {
    if (rendition && rendition.current) {
      function setRenderSelection(cfiRange, contents) {
        if (rendition.current) {
          setSelections((list) =>
            list.concat({
              text: rendition.current.getRange(cfiRange).toString(),
              cfiRange,
            })
          );
          rendition?.current.annotations.add(
            "highlight",
            cfiRange,
            {},
            undefined,
            "hl",
            { fill: "red", "fill-opacity": "0.5", "mix-blend-mode": "multiply" }
          );
          const selection = contents.window.getSelection();
          selection?.removeAllRanges();
        }
      }
      rendition.current.on("selected", setRenderSelection);
      return () => {
        rendition?.current?.off("selected", setRenderSelection);
      };
    }
  }, [setSelections]);
  const [textToSpeech, setTextToSpeech] = useState({ text: "" });
  useEffect(() => {
    if (selections && selections?.length) {
      setTextToSpeech(selections[selections?.length - 1]);
    }
  }, [selections]);

  const handleLocationChanged = (loc) => {
    localStorage.setItem(`${data?.filteredData?.id}-persist-location`, loc);
    setLocation(loc);
  };
  // EPUB ACTION STATES
  const toc = useRef([]);
  const [tocState, setTocState] = useState(null);
  const currentEpubPage = useRef(1);
  const currentChapter = useRef(null);

  return (
    <div className="" style={{ height: "100%", width: "90%" }}>
      {data?.filteredData?.header != null && (
        <EpubActions
          actions={
            <div className="custom-btn-group">
              <div className="audio-button ">
                {!!selections?.length && (
                  <TextToSpeech text={textToSpeech?.text} />
                )}
              </div>
            </div>
          }
          callback={data?.callback}
          url={`${data?.filteredData?.url}`}
          unitId={data?.filteredData?.id}
          batch_id={data?.filteredData?.batch_id}
          node={data?.filteredData}
          toc={toc.current ?? tocState}
          header={data?.filteredData?.header}
          currentChapter={currentChapter.current}
        >
          {scrollable && (
            <ReactReader
              url={`${data?.filteredData?.url}`}
              epubInitOptions={{
                openAs: "epub",
              }}
              epubOptions={{
                flow: "scrolled",
                manager: "continuous",
              }}
              location={epubPersistedLocation ?? location}
              tocChanged={(_toc) => {
                toc.current = _toc;
                setTocState(_toc);
              }}
              locationChanged={(loc) => {
                handleLocationChanged(loc);
                if (rendition.current && tocState) {
                  const { displayed, href } = rendition.current.location.start;
                  const chapter = tocState?.find((item) => item.href === href);
                  currentChapter.current = chapter;
                  currentEpubPage.current = displayed.page;
                }
              }}
              getRendition={(_rendition) => {
                rendition.current = _rendition;
              }}
            />
          )}
          {selection && (
            <ReactReader
              url={`${data?.filteredData?.url}`}
              epubInitOptions={{
                openAs: "epub",
              }}
              location={epubPersistedLocation ?? location}
              tocChanged={(_toc) => {
                toc.current = _toc;
                setTocState(_toc);
              }}
              locationChanged={(loc) => {
                handleLocationChanged(loc);
                if (rendition.current && tocState) {
                  const { displayed, href } = rendition.current.location.start;
                  const chapter = tocState?.find((item) => item.href === href);
                  currentChapter.current = chapter;
                  currentEpubPage.current = displayed.page;
                }
              }}
              getRendition={(_rendition) => {
                rendition.current = _rendition;
              }}
            />
          )}
          {!scrollable && !selection && (
            <ReactReader
              url={`${data?.filteredData?.url}`}
              epubInitOptions={{
                openAs: "epub",
              }}
              location={epubPersistedLocation ?? location}
              tocChanged={(_toc) => {
                toc.current = _toc;
                setTocState(_toc);
              }}
              locationChanged={(loc) => {
                handleLocationChanged(loc);
                if (rendition.current && tocState) {
                  const { displayed, href } = rendition.current.location.start;
                  const chapter = tocState?.find((item) => item.href === href);
                  currentChapter.current = chapter;
                  currentEpubPage.current = displayed.page;
                }
              }}
              getRendition={(_rendition) => {
                rendition.current = _rendition;
              }}
            />
          )}
        </EpubActions>
      )}
    </div>
  );
}

export default App;
