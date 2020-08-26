import React, { useEffect, useState } from 'react';
import Datatable from 'react-data-table-component';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { symptomsArr, arrangements, zones } from '../util/commonObj';
import moment from 'moment';

const storage = window.require('electron-json-storage');

const getDate = time => {
  if (time) {
    return moment(time).format("DD-MMM-YY");
  } else {
    return '';
  }
}

const getSymptoms = (symArr) => {
  return symArr.map(sym => symptomsArr.find(arrVal => arrVal.key === sym).value);
}

export default function PersonList(props) {
  const [personList, setPersonList] = useState([]);
  const [barracks, setBarracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const columns = [
    {
      name: 'Person Name',
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
      cell: row => <div>{getSymptoms(row.symptoms).map(sym => <div key={`${row.name}-${sym}`}>{sym}</div>)}</div>,
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
      name: 'Edit',
      selector: 'uid',
      cell: row => <div className="icon-button" onClick={() => editPerson(row.uid)}>Edit</div>
    },
    {
      name: 'Delete',
      selector: 'uid',
      cell: row => <div className="icon-button" onClick={() => deletePerson(row.uid)}>Delete</div>,
    }
  ];

  const history = useHistory();
  const editPerson = id => {
    if (localStorage.getItem('personEditId')) {
      localStorage.removeItem('personEditId');
    }
    localStorage.setItem('personEditId', id);
    history.push("/personMgmt");
  }

  const deletePerson = id => {
    let index = personList.findIndex(person => person.uid === id);
    let personBarrack = personList[index].barrackA;
    let tempPersonList = [...personList];
    tempPersonList.splice(index, 1);
    setPersonList(tempPersonList);

    if (personBarrack) {
      let barrIndex = barracks.findIndex(barr => barr.name === personBarrack);
      let tempBarracks = [...barracks];
      tempBarracks.splice(barrIndex, 1);
      setBarracks(tempBarracks);
      saveBarracks(tempBarracks);
    }

    storage.set('personList', tempPersonList, function (error) {
      let appearance, msg;
      if (error) {
        appearance = 'warning';
        msg = 'Error occured while saving updated list!';
      } else {
        appearance = 'success';
        msg = 'Changes saved successfully!';
      }
      showToast(msg, appearance);
    });
  }

  const saveBarracks = tempBarracks => {
    storage.set('initialSetup', {
      ...props.initialSetup,
      initialSetup: {
        ...props.initialSetup.initialSetup,
        barracks: tempBarracks
      }
    }, function (error) {
      if (error) {
        console.log('Error occured while saving changes!', 'warning');
      } else {
        console.log('Changes saved successfully!', 'success');
      }
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
    if ('initialSetup' in props.initialSetup) {
      setBarracks(props.initialSetup.initialSetup.barracks);
    }
    storage.get('personList', function (error, data) {
      setLoading(false);
      if (error) {
        showToast('Error occured while fetching list!', 'warning');
      } else if (data.length) {
        setPersonList(data);
      }
    });
  }, []);

  return (
    <div className="setup-form">
      <Datatable
        title=""
        columns={columns}
        data={personList}
        defaultSortField="name"
        pagination={false}
        highlightOnHover
        striped
        progressPending={loading}
        noDataComponent={<div>No data found!</div>}
      ></Datatable>
    </div>
  )
}