import React from 'react';
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import links from './links';

export default function Header(){
  const location = useLocation();

  return (
    <div className="header">
      {
        links.map(({ link, name }) => {
          return (
            <Link key={name} to={link} className={location.pathname === link ? 'active':''}>{name}</Link>
          )
        })
      }
    </div>
  )
}