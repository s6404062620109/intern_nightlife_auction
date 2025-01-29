import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "../../api/backend";

import style from "./css/auction.module.css";
import AuctionTable from "../../components/AuctionTable";

function Auction() {
  const { id } = useParams();
  const [tableData, setTableData] = useState([]);
  const [tableSelected, setTableSelected] = useState("");
  const closePopup = () => setTableSelected('');

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await backend.get(`/table/readByVenueId/${id}`);

        if (response.status === 200) {
          let data = response.data.data;

          setTableData(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchTable();
  }, [id]);

  return (
    <div className={style.container}>
      <div className={style.content}>
        <h2>Table Map</h2>
        <img alt="Table Map" src="/Schema-table_plan.drawio.png" />

        <div className={style["selected-wrap"]}>
          <label>Auction table</label>
          <select
            onChange={(e) => setTableSelected(e.target.value)}
            value={tableSelected}
          >
            <option value="">Select a table</option>
            {tableData.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tableSelected && (
        <>
          <div
            className={`${style.overlay} ${tableSelected ? style.show : ""}`}
            onClick={closePopup}
          ></div>
          <div
            className={`${style["auction-table-wrap"]} ${
              tableSelected ? style.show : ""
            }`}
          >
            <img
              alt="Close button"
              src="/Close_round.svg"
              onClick={closePopup}
              className={style.closeButton}
            />
            <AuctionTable tableId={tableSelected} />
          </div>
        </>
      )}
    </div>
  );
}

export default Auction;
