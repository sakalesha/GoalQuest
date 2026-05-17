// client/src/components/shared/RoleBadge.jsx
import React from 'react';
import { Tag } from 'antd';

const RoleBadge = ({ role }) => {
  let color = 'blue';
  if (role === 'manager') color = 'purple';
  if (role === 'admin') color = 'gold';

  return (
    <Tag color={color} className="uppercase font-bold text-[10px]">
      {role}
    </Tag>
  );
};

export default RoleBadge;
