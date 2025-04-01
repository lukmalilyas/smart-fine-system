import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import DialogWrapper from "../wrappers/dialog-wrapper";
import api from "../../libs/apiCall";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ViewFines = ({ isOpen, setIsOpen, selectedRow }) => {
  const [finesData, setFinesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFines = async () => {
      if (!selectedRow?.original?.LicensePlate) return;

      setLoading(true);
      const licensePlate = selectedRow?.original?.LicensePlate;
      console.log(licensePlate);

      try {
        const { data: res } = await api.get(`fines/${licensePlate}`);
        console.log(res.data);
        setFinesData(res.data || []); // ensure it's always an array
      } catch (error) {
        console.error("Error retrieving fines:", error);
        setFinesData([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRow?.original?.LicensePlate) {
      getFines();
    }
  }, [selectedRow]);

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <DialogWrapper isOpen={isOpen} closeModal={closeModal}>
      <DialogPanel className="w-full max-w-3xl max-h-screen transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all">
        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300 mb-4 uppercase">
          Fine History For {selectedRow?.original?.LicensePlate}
        </DialogTitle>

        <div className="bg-white p-6 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : (
            finesData.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 shadow-lg">
                {finesData.map((fine, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardContent>
                      <div>
                        <p>Date: {fine.CreatedAt}</p>
                        <p>Longitudinal Value: {fine.LongitudinalValue}</p>
                        <p>Latitudinal Value: {fine.LatitudinalValue}</p>
                        <p>Speed: {fine.Speed}</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 bg-black text-white">
                        Send fine
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No fines found for this vehicle.</p>
            )
          )}
        </div>
      </DialogPanel>
    </DialogWrapper>
  );
};

export default ViewFines;
