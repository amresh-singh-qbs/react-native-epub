import { useEffect, useRef, useState } from "react";

export const EpubActions = ({
  title,
  actions,
  children,
  above = null,
  callback,
  url,
  unitId,
  toc,
  batch_id,
  currentChapter,
  node,
  header,
}) => {
  const current_page = useRef(
    node?.unit_progress?.current_page ? +node?.unit_progress?.current_page : 1
  );

  const [total_pages, setTotal_pages] = useState(0);

  useEffect(() => {
    if (toc && toc.length) {
      setTotal_pages(toc.length);
      if (currentChapter)
        current_page.current =
          toc.indexOf(toc.find((ele) => ele.href == currentChapter.href)) + 1;
    }
  }, [toc, currentChapter]);

  const sendProgress = (section) => {
    fetch("https://qbslms.qbslearning.com/api/sectionUnitProgress", {
      method: "POST",
      headers: header.map,
      body: JSON.stringify(section),
    })
      .then((resp) => resp.json())
      .then((resp) => console.log("resp", resp))
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    if (total_pages > 0) {
      let obj = {
        unit_id: unitId,
        batch_id,
        current_page: current_page.current,
        total_page: total_pages,
      };
      sendProgress(obj);
      offlineProgress(obj);
    }
  }, [url, total_pages, current_page.current]);

  const offlineProgress = (data) => {
    console.log("DATA::", data);
    window.postMessage(JSON.stringify(data));
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <h1 className="h1">{title}</h1>
        {actions && (
          <div className="flex items-start flex-wrap gap-2">{actions}</div>
        )}
      </div>
      {above}
      {/* md:aspect-video aspect-[3/4] w-full border border-stone-300 rounded overflow-hidden */}
      <div className="ePub">{children}</div>
    </div>
  );
};
