import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { adminBusinessList } from "../../api/business";
import GenericTable from "../utilComponents/Table";
import TextInput from "../utilComponents/TextInput";
import styles from "./AdminBusiness.module.scss";
import { FaSearch } from "react-icons/fa";
import {
  BusinessResponse,
  BusinessQueryNames,
} from "../../api/requests_responses/business";
import { useNavigate } from "react-router-dom";
import CustomNotification from "../utilComponents/Notifications";
import {
  setLocalStorageHeaderEmail,
  unsetLocalStorage,
} from "../../utils/utils";
import { UserLocalStorageTypes } from "../../utils/constants";

const AdminBusiness = () => {
  const navigate = useNavigate();
  useEffect(() => {
    unsetLocalStorage(UserLocalStorageTypes.ADMIN_ACCESS_EMAIL);
  }, []);

  const [searchString, setSearchString] = useState<string>("");
  const [showNotif, setShowNotif] = useState<boolean>(false);

  const { data: businessList, isLoading } = useQuery(
    [BusinessQueryNames.ADMIN_GET_BUSINESS_LIST, searchString],
    () => adminBusinessList(searchString).then((res) => res.data),
  );

  const headers = ["Name", "Email", "Business Type", "Created At"];
  const keys = ["name", "email", "business_type", "created_time"] as const; // Fields in the row objects

  const handleRowClick = (row: BusinessResponse) => {
    setLocalStorageHeaderEmail(row.email);
    setShowNotif(true);
    setTimeout(() => {
      navigate("/");
      setShowNotif(false);
    }, 3000);
  };

  return (
    <>
      {showNotif && (
        <CustomNotification
          loading
          type="info"
          message="Starting Session"
          onClose={() => setShowNotif(false)}
        />
      )}
      <div className={styles.adminTable}>
        <TextInput
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Search..."
          icon={<FaSearch />}
          iconPosition="start"
        />
        <GenericTable
          headers={headers}
          keys={keys}
          rows={businessList?.items || []}
          loading={isLoading}
          className="custom-table-class" // Optional custom styles
          onRowClick={handleRowClick} // Pass the row click handler
        />
      </div>
    </>
  );
};

export default AdminBusiness;
