import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "../../api/backend";

import style from "./css/myauction.module.css";

function MyAuction() {
  const { id, ownerId } = useParams();
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchMyAuction = async () => {
      try {
        const response = await backend.get(`/auction/readMyAuctions/${id}`);

        if (response.status === 200) {
          setTableData(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchMyAuction();
  }, [id]);

  const toggleRow = (tableId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [tableId]: !prev[tableId],
    }));
  };

  return (
    <div className={style.container}>
      <h2>Table List</h2>
      <table>
        <thead>
          <tr>
            <th>Table/Auctions</th>
            <th>Number of seats</th>
            <th>Auction Quantity</th>
          </tr>
        </thead>

        <tbody>
          {tableData.map((table) => (
            <React.Fragment key={table._id}>
              <tr
                className={style.clickableRow}
                onClick={() => toggleRow(table._id)}
              >
                <td>{table.name}</td>
                <td>{table.seats}</td>
                <td>{table.auctions?.length || 0}</td>
              </tr>

              {expandedRows[table._id] && table.auctions.length > 0 && (
                <tr className={expandedRows[table._id] ? style.visibleRow : style.hiddenRow}>
                  <td colSpan="3">
                    <table className={style.miniTable}>
                      <thead>
                        <tr>
                          <th>เวลาเข้าใช้งาน</th>
                          <th>ราคาเริ่มต้น</th>
                          <th>ราคาสุดท้าย</th>
                          <th>เวลาประมูล</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.auctions.map((auction) => (
                          <tr key={auction._id}>
                            <td>
                              {new Date(auction.accesstime).toLocaleString()}
                            </td>
                            <td>{auction.startCoins}</td>
                            <td></td>
                            <td>
                              {new Date(
                                auction.checkpoint.start
                              ).toLocaleString()}{" "}
                              -
                              {new Date(
                                auction.checkpoint.end
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyAuction;
