import React, { useEffect, useState } from "react";
import axios from "axios";

type Owner = {
  id: number;
  hoTen: string;
  maQuyen: number;
};

function OwnerSelect() {
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users/full");
        const filtered = response.data.filter((user: Owner) => user.maQuyen === 5);
        setOwners(filtered);
      } catch (error) {
        console.error("Lỗi khi tải danh sách owner:", error);
      }
    };

    fetchOwners();
  }, []);

  return (
    <div className="mb-3">
      <label className="form-label fw-bold">Chủ phòng khám</label>
      <select className="form-select">
        <option value="">-- Chọn chủ phòng khám --</option>
        {owners.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.hoTen}
          </option>
        ))}
      </select>
    </div>
  );
}

export default OwnerSelect;
