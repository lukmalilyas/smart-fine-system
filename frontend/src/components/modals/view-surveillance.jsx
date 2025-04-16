import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import DialogWrapper from "../wrappers/dialog-wrapper";
import api from "../../libs/apiCall";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ViewSurveillance = ({ isOpen, setIsOpen, selectedRow }) => {
  const [surveillanceData, setSurveillanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFines = async () => {
      if (!selectedRow?.original?.LicenseNumber) return;

      setLoading(true);
      const licenseNumber = selectedRow?.original?.LicenseNumber;
      console.log(licenseNumber);

      try {
        const { data: res } = await api.get(`surveillance/${licenseNumber}`);
        console.log(res.data);
        setSurveillanceData(res.data || []); // ensure it's always an array
      } catch (error) {
        console.error("Error retrieving surveillance data:", error);
        setSurveillanceData([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRow?.original?.LicenseNumber) {
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
          Surveillance History For {selectedRow?.original?.RestaurantName}
        </DialogTitle>

        <div className="bg-white p-6 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : (
            surveillanceData.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 shadow-lg">
                {surveillanceData.map((surveillance, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardContent>
                      <div>
                        <p>Date: {surveillance.Date}</p>
                        <p>Time: {surveillance.Time}</p>
                        <p>Track ID: {surveillance.TrackID}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No surveillance found for this restaurant.</p>
            )
          )}
        </div>
      </DialogPanel>
    </DialogWrapper>
  );
};

export default ViewSurveillance;
