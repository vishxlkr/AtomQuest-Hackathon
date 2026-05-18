import Table from "../ui/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function UserTable({
   users = [],
   onManageManager,
   managerUpdatingId,
   onDelete,
   deletingId,
}) {
   const columns = [
      { key: "employeeId", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
   ];

   if (onManageManager) {
      columns.push({
         key: "manager",
         label: "Manager",
         render: (r) => (
            <div className="flex min-w-56 items-center gap-3">
               <span className="min-w-0 flex-1 truncate text-slate-300">
                  {r.managerId?.name || "No manager"}
               </span>
               <Button
                  type="button"
                  variant="primary"
                  className="px-3 py-1.5"
                  disabled={managerUpdatingId === r._id}
                  isLoading={managerUpdatingId === r._id}
                  onClick={() => onManageManager(r)}
               >
                  {r.managerId ? "Change" : "Assign"}
               </Button>
            </div>
         ),
      });
   }

   columns.push(
      {
         key: "status",
         label: "Status",
         render: (r) => (
            <Badge tone={r.isActive ? "green" : "red"}>
               {r.isActive ? "Active" : "Inactive"}
            </Badge>
         ),
      },
      {
         key: "actions",
         label: "Actions",
         render: (r) => (
            <Button
               type="button"
               variant="danger"
               className="px-3 py-1.5"
               disabled={!r.isActive || deletingId === r._id}
               isLoading={deletingId === r._id}
               onClick={() => onDelete?.(r)}
            >
               Delete
            </Button>
         ),
      }
   );

   return (
      <Table
         rows={users}
         columns={columns}
      />
   );
}
