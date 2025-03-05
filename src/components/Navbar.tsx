import { useLocation } from "react-router-dom";


const Navbar = () => { 

    const { pathname } = useLocation();

    return (
        <nav className="px-4 py-8">
            <ul className="flex">
                <li className={pathname === "/users" ? "font-bold" : ""}>
                    <a href="/users">Users</a>  
                </li>
                <li className="mx-2">/</li>
                <li className={pathname === "/products" ? "font-bold" : ""}>
                    <a href="/products">Products</a>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;