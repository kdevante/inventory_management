'use client'
import { useState } from "react";
import Auth from "./auth";
import Inventory from "./Inventory";

export default function Home() {
    const [user, setUser] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [open, setOpen] = useState(false);

    return (
        <>
            {!user ? (
                <Auth setUser={setUser} setOpen={setOpen} setInventory={setInventory} />
            ) : (
                <Inventory user={user} />
            )}
        </>
    );
}
