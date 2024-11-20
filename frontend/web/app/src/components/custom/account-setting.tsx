export const AccountSettings = () => (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Account Settings</h2>
      <ul>
        <li className="p-4 border-b">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Bank Account 1</p>
            </div>
            <div>
              <button className="text-red-500">Delete</button>
            </div>
          </div>
        </li>
        <li className="p-4 border-b">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Bank Account 2</p>
            </div>
            <div>
              <button className="text-red-500">Delete</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );