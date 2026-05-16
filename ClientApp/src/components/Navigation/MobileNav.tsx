import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "../Logo";
import { useTheme } from "../../context/ThemeContext";

interface NavItem {
  name: string;
  path: string;
  icon?: React.ElementType;
  subitems?: Array<{ name: string; path: string; icon?: React.ElementType }>;
}

interface MobileNavProps {
  items: NavItem[];
  onNavigate?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ items, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleSubitems = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleNavigate = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <>
      {/* Hamburger Button */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 h-16 z-50 border-b flex items-center px-4 transition-colors
        ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
      >
        <button
          onClick={toggleMenu}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? "hover:bg-gray-800"
              : "hover:bg-gray-100"
          }`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex-1 flex justify-center">
          <Link to="/home" onClick={handleNavigate} className="py-2">
            <Logo />
          </Link>
        </div>

        <div className="w-10" />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 pt-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={`md:hidden fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-all duration-300 shadow-lg
        ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }
        ${isDark ? "bg-gray-900" : "bg-white"}`}
      >
        <div className="p-4 space-y-2">
          {items.map((item) => (
            <div key={item.name}>
              {/* Main Item */}
              <div className="flex items-center">
                <Link
                  to={item.path}
                  onClick={handleNavigate}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-800 text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.icon && <item.icon size={20} />}
                  <span className="font-medium">{item.name}</span>
                </Link>

                {/* Expand Button for Subitems */}
                {item.subitems && item.subitems.length > 0 && (
                  <button
                    onClick={() => toggleSubitems(item.name)}
                    className={`p-2 rounded-lg transition-transform ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } ${expandedItems.includes(item.name) ? "rotate-180" : ""}`}
                  >
                    <ChevronDown size={18} />
                  </button>
                )}
              </div>

              {/* Subitems */}
              {item.subitems &&
                item.subitems.length > 0 &&
                expandedItems.includes(item.name) && (
                  <div
                    className={`ml-4 mt-2 space-y-1 pl-4 border-l-2 ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    {item.subitems.map((subitem) => (
                      <Link
                        key={subitem.name}
                        to={subitem.path}
                        onClick={handleNavigate}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isDark
                            ? "hover:bg-gray-800 text-gray-300"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {subitem.icon && <subitem.icon size={18} />}
                        <span>{subitem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </nav>

      {/* Add top padding to main content when menu is open */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default MobileNav;
