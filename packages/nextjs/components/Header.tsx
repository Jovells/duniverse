"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { THE_GRAPH_URL } from "~~/app/constants";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

let isSeller = false;

export const HeaderMenuLinks = () => {
  const { address } = useAccount();
  const menuLinks: HeaderMenuLink[] = [
    {
      label: "Planets",
      href: "/stores",
    },
    // {
    //   label: "Products",
    //   href: "/products",
    //   // icon: <BugAntIcon className="h-4 w-4" />,
    // },
    {
      label: "Dashboard",
      href: isSeller ? `/seller-dashboard/${address}` : `buyer-dashboard/${address}`,
      // icon: <BugAntIcon className="h-4 w-4" />,
    },
  ];
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col outline outline-1`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  // Graphql queries
  async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
    const response = await fetch(THE_GRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables,
        operationName,
      }),
    });

    return await response.json();
  }

  const operation = `
      query MyQuery {
        sellers(where: { id: ${useAccount().address} }) {
          id
        }
      }
    `;

  function fetchMyQuery() {
    return fetchGraphQL(operation, "MyQuery", {});
  }
  useEffect(() => {
    // const { address: connectedAddress } = useAccount();
    fetchMyQuery()
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        } else {
          console.log(data);
          data?.length ? (isSeller = true) : (isSeller = false);
        }
      })
      .catch(error => {
        console.error("Error fetching query:", error);
      });
  }, []);

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image width={200} height={200} alt="SE2 logo" className="w-[200px] cursor-pointer" src="/logo.jpeg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">D-UNIVERSE</span>
            <span className="text-xs">Decentralized Market</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        {/* <FaucetButton /> */}
      </div>
    </div>
  );
};
