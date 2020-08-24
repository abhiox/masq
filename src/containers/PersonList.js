import React, { useEffect, useState } from 'react';
import Datatable from 'react-data-table-component';
import { useToasts } from 'react-toast-notifications';
import { symptomsArr, arrangements, zones } from '../util/commonObj';
import moment from 'moment';

const storage = window.require('electron-json-storage');

const getDate = time => {
  if(time){
    return moment(time).format("DD-MMM-YY");
  }else{
    return '';
  }
}

const getSymptoms = (symArr) => {
  return symArr.map(sym => symptomsArr.find(arrVal => arrVal.key === sym).value);
}

export default function PersonList() {
  const [personList, setPersonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [dense, setDense] = useState(false);
  const columns = [
    {
      name: 'Name',
      selector: 'name',
      sortable: true,
    },
    {
      name: 'Barrack Alloted',
      selector: 'barrackA',
      sortable: true,
    },
    {
      name: 'Travel Mode',
      selector: 'tMode',
      sortable: true,
      cell: row => <div>{arrangements.find(arr => arr.key === row.tMode).value}</div>,
    },
    {
      name: 'Unit',
      selector: 'unitA',
      sortable: true,
    },
    {
      name: 'Address',
      selector: 'address',
      sortable: true,
      cell: row => <div className="preformat">{row.address.trim()}</div>,
    },
    {
      name: 'Symptoms',
      selector: 'symptoms',
      sortable: true,
      cell: row => <div>{getSymptoms(row.symptoms).map(sym => <div>{sym}</div>)}</div>,
    },
    {
      name: 'Other Symptoms',
      selector: 'oSymptom',
      sortable: true,
    },
    {
      name: 'Zone',
      selector: 'zone',
      sortable: true,
      cell: row => <div>{zones.find(zone => zone.key === row.zone).value}</div>,
    },
    {
      name: 'Arrival Date',
      selector: 'arrivalDate',
      sortable: true,
      cell: row => <div>{getDate(row.arrivalDate)}</div>,
    },
    {
      name: 'Delete',
      selector: 'uid',
      sortable: true,
      cell: row => <div className="icon-button" onClick={() => deletePerson(row.uid)}>Delete</div>,
    }
  ];

  const deletePerson = id => {
    let index = personList.findIndex(person => person.uid === id);
    let tempPersonList = [ ...personList ];
    tempPersonList.splice(index, 1); 
    setPersonList(tempPersonList);

    storage.set('personList', tempPersonList, function (error) {
      let appearance, msg;
      if (error){
        appearance = 'warning';
        msg = 'Error occured while saving updated list!';
      }else{
        appearance = 'success';
        msg = 'Changes saved successfully!';
      } 
      showToast(msg, appearance);
    });
  }

  const { addToast } = useToasts();
  const showToast = (msg, appearance) => {
    addToast(msg, {
      appearance,
      autoDismiss: true,
    });
  }

  useEffect(() => {
    setLoading(true);
    storage.get('personList', function (error, data) {
      setLoading(false);
      if (error) {
        showToast('Error occured while fetching list!', 'warning');
      }else if (data.length) {
        setPersonList(data);
      }
    });
  }, []);

  return (
    <div className="setup-form">
      {
        personList.length ?
        <Datatable
          title=""
          columns={columns}
          data={personList}
          defaultSortField="name"
          pagination={pagination}
          highlightOnHover
          striped
          dense={dense}
          progressPending={loading}
        ></Datatable>:
        <div>No data found!</div>
      }
    </div>
  )
}