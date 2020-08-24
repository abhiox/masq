import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { getUniqueID } from '../util/helper';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { symptomsArr, arrangements, zones } from '../util/commonObj';

const storage = window.require('electron-json-storage');

export default function PersonManagement(props) {
  const [initialSetup, setInitialSetup] = useState({
    setupPresent: true
  });
  const [units, setUnits] = useState([]);
  const [barracks, setBarracks] = useState([]);
  const [person, setPerson] = useState({
    uid: '',
    name: "",
    barrackA: "",
    tMode: "",
    unitA: "",
    address: "",
    symptoms: [],
    oSymptom: "",
    zone: "",
    arrivalDate: new Date().getTime()
  });
  const [personList, setPersonList] = useState([]);

  useEffect(() => {
    if (!('initialSetup' in props.initialSetup)) {
      setInitialSetup({ setupPresent: false });
    } else {
      setInitialSetup({ setupPresent: true, ...props.initialSetup });
      setUnits(props.initialSetup.initialSetup.dependentUnits);
      setBarracks(props.initialSetup.initialSetup.barracks);
    }
  }, [props.initialSetup]);

  useEffect(() => {
    storage.get('personList', function (error, data) {
      if (error) throw error;

      if (data.length) {
        setPersonList(data);
      }
    });
  }, []);

  const changeHandler = e => {
    let key = e.target.name;
    let val = e.target.value;
    setPerson({ ...person, [key]: val });
  }

  const saveBarracks = tempBarracks => {
    let setup = { ...initialSetup };
    delete setup.setupPresent;
    storage.set('initialSetup', {
      ...setup,
      initialSetup: {
        ...setup.initialSetup,
        totalBarracks: tempBarracks
      }
    }, function (error) {
      if (error) {
        console.log('error occured while saving barrack changes!');
      }
    });
  }

  const changeSymptomHandle = e => {
    const symptoms = [...person.symptoms];
    let value = e.target.value;
    let index = symptoms.findIndex(sym => sym === value);
    if (index === -1) {
      symptoms.push(value);
    } else {
      symptoms.splice(index, 1);
    }

    setPerson({ ...person, symptoms });
  }

  const { addToast } = useToasts();
  const showToast = (msg, appearance) => {
    addToast(msg, {
      appearance,
      autoDismiss: true,
    });
  }

  const savePerson = () => {
    let personListTemp = [...personList];
    let personExists = true;
    if (!person.uid) { // adding a new person
      personExists = false;
      let personTemp = { ...person, uid: getUniqueID() };
      setPerson(personTemp);
      personListTemp = [...personList, personTemp];
    } else { // saving changes to the previous person
      let index = personList.findIndex(p => p.uid === person.uid);
      personListTemp = [
        ...personList.slice(0, index),
        person,
        ...personList.slice(index + 1, personList.length)
      ];
    }

    setPersonList(personListTemp);
    calculateBarrackOccupied(personListTemp); // calculating and saving barrack occupied

    storage.set('personList', personListTemp, function (error) {
      let appearance, msg;
      if (error) {
        appearance = 'warning';
        msg = `Error occured while saving${personExists ? ' changes' : ''}!`
      } else {
        appearance = 'success';
        msg = personExists ? 'Changes saved successfully!' : 'Person added successfully!'
      }
      showToast(msg, appearance);
    });
  }

  const calculateBarrackOccupied = personListTemp => {
    let barrackList = {};
    personListTemp.forEach(per => {
      if (per.barrackA) {
        if (barrackList[per.barrackA]) {
          barrackList[per.barrackA]++;
        } else {
          barrackList[per.barrackA] = 1;
        }
      }
    });

    let tempBarracks = [...barracks];
    tempBarracks.forEach(bar => {
      bar.occupied = barrackList[bar.name];
    });
    setBarracks(tempBarracks);
    saveBarracks(tempBarracks);
  }

  return (
    <div className="setup-form">
      {
        initialSetup.setupPresent === false &&
        <Link className="setup-begin" to="/setup">Please click here to begin the setup</Link>
      }
      {
        initialSetup.setupPresent === true &&
        <>
          <div className="input-div">
            <label>NAME</label>
            <div className="input-right">
              <input type="text" name="name" value={person.name} onChange={e => changeHandler(e)} />
            </div>
          </div>
          <div className="input-div">
            <label>UNIT</label>
            <div className="input-right">
              <select name="unitA" value={person.unitA} onChange={e => changeHandler(e)}>
                <option value="">Select a unit</option>
                {
                  units.map((unit, index) => {
                    return (
                      <option key={`unit-${unit}-${index}`} value={unit}>{unit.name}</option>
                    )
                  })
                }
              </select>
            </div>
          </div>
          <div className="input-div">
            <label>Arrival Date</label>
            <div className="input-right">
              <DatePicker
                selected={person.arrivalDate}
                name="arrivalDate"
                maxDate={new Date()}
                dateFormat="dd MMM yyyy"
                onChange={e => setPerson({ ...person, "arrivalDate": e.getTime() })}
              />
            </div>
          </div>
          <div className="input-div">
            <label>Allot Barrack</label>
            <div className="input-right">
              <select name="barrackA" value={person.barrackA} onChange={e => changeHandler(e)}>
                <option value="">Select a barrack</option>
                {
                  barracks
                    .filter(barr => parseInt(barr.occupied) !== parseInt(barr.vacancy))
                    .map((barrack, index) => {
                      return (
                        <option key={`barrack-${barrack.name}-${index}`} value={barrack.name}>{barrack.name}</option>
                      )
                    })
                }
              </select>
            </div>
          </div>
          <div className="input-div">
            <label>Mode of Travel</label>
            <div className="input-right">
              <select name="tMode" value={person.tMode} onChange={e => changeHandler(e)}>
                <option value="">Select a value</option>
                {
                  arrangements.map(arrangement => {
                    return (
                      <option key={arrangement.key} value={arrangement.key}>{arrangement.value}</option>
                    )
                  })
                }
              </select>
            </div>
          </div>
          <div className="input-div">
            <label>Address during Leave</label>
            <div className="input-right">
              <textarea name="address" value={person.address} onChange={e => changeHandler(e)} />
            </div>
          </div>
          <div className="input-div">
            <label>Symptoms</label>
            <div className="input-right">
              <div className="label-wrap none-select">
                {
                  symptomsArr.map(symptom => {
                    return (
                      <label key={symptom.key}>
                        <input
                          type="checkbox"
                          name="symptom"
                          value={symptom.key}
                          checked={person.symptoms.findIndex(sym => sym === symptom.key) !== -1}
                          onChange={e => changeSymptomHandle(e)}
                        />
                        <span>{symptom.value}</span>
                      </label>
                    )
                  })
                }
              </div>
              <div className="any-other none-select">
                <div>Any other:</div>
                <input
                  type="text"
                  name="oSymptom"
                  value={person.oSymptom}
                  onChange={e => changeHandler(e)}
                />
              </div>
            </div>
          </div>
          <div className="input-div">
            <label>Zone during Leave</label>
            <div className="input-right">
              <select name="zone" value={person.zone} onChange={e => changeHandler(e)}>
                <option value="">Select a zone</option>
                {
                  zones.map(zone => {
                    return (
                      <option key={zone.key} value={zone.key}>{zone.value}</option>
                    )
                  })
                }
              </select>
            </div>
          </div>
          <div className="icon-button save-form" onClick={() => savePerson()}>Save</div>
        </>
      }
    </div>
  )
}